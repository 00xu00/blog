import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.header import Header
from app.core.config import settings
import random
import string
import logging
import ssl
import traceback

logger = logging.getLogger(__name__)

def generate_verification_code(length=6):
    """生成指定长度的数字验证码"""
    return ''.join(random.choices(string.digits, k=length))

def send_verification_email(to_email: str, code: str):
    """发送验证码邮件"""
    try:
        # 创建邮件对象
        msg = MIMEMultipart()
        msg['From'] = settings.SMTP_USERNAME
        msg['To'] = to_email
        msg['Subject'] = "曦景博客 - 验证码"

        # 邮件正文
        body = f"""
        <html>
            <body>
                <h2>曦景博客验证码</h2>
                <p>您的验证码是：<strong>{code}</strong></p>
                <p>验证码有效期为5分钟，请尽快使用。</p>
                <p>如果这不是您的操作，请忽略此邮件。</p>
            </body>
        </html>
        """
        msg.attach(MIMEText(body, 'html', 'utf-8'))

        # 创建SSL上下文
        context = ssl.create_default_context()
        context.check_hostname = False
        context.verify_mode = ssl.CERT_NONE

        # 连接SMTP服务器并发送邮件
        logger.info(f"正在连接SMTP服务器: {settings.SMTP_HOST}:{settings.SMTP_PORT}")
        server = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, context=context)
        server.set_debuglevel(1)  # 启用调试模式
        
        try:
            logger.info("正在登录SMTP服务器...")
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            logger.info("SMTP服务器登录成功")
            
            logger.info(f"正在发送邮件到: {to_email}")
            server.sendmail(settings.SMTP_USERNAME, [to_email], msg.as_string())
            logger.info(f"验证码邮件发送成功: {to_email}")
            return True
        except smtplib.SMTPAuthenticationError as e:
            logger.error(f"SMTP认证失败: {str(e)}")
            logger.error(f"认证信息: 用户名={settings.SMTP_USERNAME}")
            return False
        except smtplib.SMTPException as e:
            logger.error(f"SMTP错误: {str(e)}")
            logger.error(f"错误详情: {traceback.format_exc()}")
            return False
        finally:
            try:
                server.quit()
            except:
                pass
    except Exception as e:
        logger.error(f"发送验证码邮件失败: {str(e)}")
        logger.error(f"错误详情: {traceback.format_exc()}")
        return False

def send_reset_password_email(to_email: str, reset_token: str):
    """发送重置密码邮件"""
    try:
        # 创建邮件对象
        msg = MIMEMultipart()
        msg['From'] = settings.SMTP_USERNAME
        msg['To'] = to_email
        msg['Subject'] = "曦景博客 - 重置密码"

        # 重置密码链接
        reset_link = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"

        # 邮件正文
        body = f"""
        <html>
            <body>
                <h2>曦景博客密码重置</h2>
                <p>您收到此邮件是因为您（或其他人）请求重置您的密码。</p>
                <p>请点击下面的链接重置密码：</p>
                <p><a href="{reset_link}">{reset_link}</a></p>
                <p>此链接有效期为1小时。</p>
                <p>如果这不是您的操作，请忽略此邮件。</p>
            </body>
        </html>
        """
        msg.attach(MIMEText(body, 'html', 'utf-8'))

        # 创建SSL上下文
        context = ssl.create_default_context()
        context.check_hostname = False
        context.verify_mode = ssl.CERT_NONE

        # 连接SMTP服务器并发送邮件
        logger.info(f"正在连接SMTP服务器: {settings.SMTP_HOST}:{settings.SMTP_PORT}")
        server = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, context=context)
        server.set_debuglevel(1)  # 启用调试模式
        
        try:
            logger.info("正在登录SMTP服务器...")
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            logger.info("SMTP服务器登录成功")
            
            logger.info(f"正在发送邮件到: {to_email}")
            server.sendmail(settings.SMTP_USERNAME, [to_email], msg.as_string())
            logger.info(f"重置密码邮件发送成功: {to_email}")
            return True
        except smtplib.SMTPAuthenticationError as e:
            logger.error(f"SMTP认证失败: {str(e)}")
            logger.error(f"认证信息: 用户名={settings.SMTP_USERNAME}")
            return False
        except smtplib.SMTPException as e:
            logger.error(f"SMTP错误: {str(e)}")
            logger.error(f"错误详情: {traceback.format_exc()}")
            return False
        finally:
            try:
                server.quit()
            except:
                pass
    except Exception as e:
        logger.error(f"发送重置密码邮件失败: {str(e)}")
        logger.error(f"错误详情: {traceback.format_exc()}")
        return False 