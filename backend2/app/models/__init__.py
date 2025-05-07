from sqlalchemy.orm import relationship
from app.models.user import User
from app.models.blog import Blog

# 在这里添加关系
User.blogs = relationship("Blog", back_populates="author") 