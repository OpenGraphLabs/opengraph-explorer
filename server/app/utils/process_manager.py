"""
Process pool manager for annotation processing

Manages the lifecycle of ProcessPoolExecutor
"""

import atexit
import os
from concurrent.futures import ProcessPoolExecutor
from typing import Optional

# Global process pool instance
_process_pool: Optional[ProcessPoolExecutor] = None


def get_process_pool() -> ProcessPoolExecutor:
    """
    Get or create the global process pool
    
    Returns:
        ProcessPoolExecutor instance
    """
    global _process_pool
    
    if _process_pool is None:
        # Create process pool with optimal worker count
        # Use more workers for batch processing scripts
        cpu_count = os.cpu_count()
        max_workers = min(cpu_count, 10)  # Allow up to 10 workers for better parallelism
        
        print(f"Initializing process pool with {max_workers} workers (CPU cores: {cpu_count})")
        _process_pool = ProcessPoolExecutor(max_workers=max_workers)
        
        # Register cleanup on exit
        atexit.register(shutdown_process_pool)
    
    return _process_pool


def shutdown_process_pool():
    """Shutdown the process pool gracefully"""
    global _process_pool
    
    if _process_pool is not None:
        _process_pool.shutdown(wait=True)
        _process_pool = None