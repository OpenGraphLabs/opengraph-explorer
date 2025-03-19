from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import JSONResponse
import os
import shutil
from pathlib import Path
import tensorflow as tf
import h5py
from services.model_service import parse_model_file

router = APIRouter()

# 업로드 디렉토리 생성
upload_dir = Path("uploads")
upload_dir.mkdir(exist_ok=True)

@router.post("/convert")
async def convert_model(model: UploadFile = File(...)):
    """
    .h5 파일을 업로드하고 Sui 블록체인용 모델 형식으로 변환합니다.
    
    Args:
        model (UploadFile): .h5 형식의 모델 파일
    
    Returns:
        dict: 변환된 모델 데이터
    """
    try:
        # 파일 확장자 확인
        if not model.filename.lower().endswith('.h5'):
            raise HTTPException(status_code=400, detail=".h5 형식의 파일만 업로드 가능합니다.")
        
        # 업로드된 파일 저장
        file_path = upload_dir / f"{model.filename}"
        print(f"파일 저장 시작: {file_path}")
        
        try:
            with open(file_path, "wb") as buffer:
                # 파일 크기 확인
                content = await model.read()
                if len(content) == 0:
                    raise HTTPException(status_code=400, detail="업로드된 파일이 비어있습니다.")
                
                buffer.write(content)
                
            print(f"파일 저장 완료. 크기: {os.path.getsize(file_path)} bytes")
            
            # 파일이 실제로 HDF5 형식인지 확인
            try:
                with h5py.File(file_path, 'r') as f:
                    # 파일이 열리면 유효한 HDF5 파일임
                    pass
            except Exception as h5_error:
                raise HTTPException(
                    status_code=400,
                    detail=f"올바른 HDF5/H5 파일 형식이 아닙니다: {str(h5_error)}"
                )
            
            # 모델 파싱
            model_data = parse_model_file(str(file_path))
            
            # 파일 처리가 완료되면 임시 파일 삭제
            if file_path.exists():
                file_path.unlink()
                print("임시 파일 삭제 완료")
            
            return model_data
            
        except HTTPException:
            raise
        except Exception as e:
            print(f"파일 처리 중 오류 발생: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"모델 변환 중 오류가 발생했습니다: {str(e)}"
            )
            
    except HTTPException:
        if 'file_path' in locals() and file_path.exists():
            file_path.unlink()
        raise
    except Exception as e:
        if 'file_path' in locals() and file_path.exists():
            file_path.unlink()
        print(f"예상치 못한 오류 발생: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"파일 처리 중 오류가 발생했습니다: {str(e)}"
        ) 