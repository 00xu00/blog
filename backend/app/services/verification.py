import random
import string
import time
from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)

# 使用字典存储验证码，格式：{email: (code, expire_time)}
verification_codes: Dict[str, tuple[str, float]] = {}

def generate_verification_code(length=6):
    """生成指定长度的数字验证码"""
    return ''.join(random.choices(string.digits, k=length))

def save_verification_code(email: str, code: str, expire_minutes=5):
    """保存验证码到内存中"""
    expire_time = time.time() + expire_minutes * 60
    verification_codes[email] = (code, expire_time)
    logger.info(f"验证码已保存: {email}")

def get_verification_code(email: str) -> Optional[str]:
    """获取验证码，如果过期则返回None"""
    if email not in verification_codes:
        return None
        
    code, expire_time = verification_codes[email]
    if time.time() > expire_time:
        del verification_codes[email]
        return None
        
    return code

def delete_verification_code(email: str):
    """删除验证码"""
    if email in verification_codes:
        del verification_codes[email]
        logger.info(f"验证码已删除: {email}")

# 定期清理过期验证码的函数
def cleanup_expired_codes():
    """清理过期的验证码"""
    current_time = time.time()
    expired_emails = [
        email for email, (_, expire_time) in verification_codes.items()
        if current_time > expire_time
    ]
    for email in expired_emails:
        del verification_codes[email]
    if expired_emails:
        logger.info(f"已清理 {len(expired_emails)} 个过期验证码") 