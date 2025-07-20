
# --------------------------------------------------------
# 4) 가중치/편향 -> (sign, magnitude, scale) 변환 (양자화X, FP32 모델)
# --------------------------------------------------------
SCALE = 8  # 예: 소수점 2자리까지

def float_to_fixed(x, scale):
    """ float -> (sign_bit, abs_val) for a given scale """
    sign_bit = 0
    if x < 0:
        sign_bit = 1
        x = -x
    factor = 10 ** scale
    abs_val = int(round(x * factor))  # 반올림
    return sign_bit, abs_val

print("\nExtracting Weights/Bias in (sign,magnitude) with scale=", SCALE)

for idx, layer in enumerate(loaded_model.layers):
    w = layer.get_weights()
    if len(w) == 0:
        # 이 레이어에 weights가 없으면 skip
        continue

    # 예: Dense => w[0](kernel), w[1](bias)
    kernel = w[0]  # shape=[in_dim, out_dim]
    bias = w[1]    # shape=[out_dim]

    print(f"\n=== Layer {idx} ({layer.name}) ===")
    print("kernel shape:", kernel.shape)

    kernel_flat = kernel.flatten()  # 1D로
    bias_flat = bias.flatten()

    # kernel 변환
    signs_k = []
    mags_k = []
    for val in kernel_flat:
        sbit, aval = float_to_fixed(val, SCALE)
        signs_k.append(sbit)
        mags_k.append(aval)

    # bias 변환
    signs_b = []
    mags_b = []
    for val in bias_flat:
        sbit, aval = float_to_fixed(val, SCALE)
        signs_b.append(sbit)
        mags_b.append(aval)

    # Move 코드에서 vector[u64] 형태로 사용하기 쉽게 출력
    # (실제로는 파일에 저장하거나, print를 복사해서 쓰면 됨)
    print("kernel magnitude:", mags_k)
    print("kernel sign    :", signs_k)
    print("bias   magnitude:", mags_b)
    print("bias   sign    :", signs_b)

    # shape, scale도 함께 출력하면 Move에서 set_layer_weights_signed_fixed(...)로 전달 가능
    print("kernel shape=", kernel.shape, " bias shape=", bias.shape)
    print(f"Scale = {SCALE}\n")
