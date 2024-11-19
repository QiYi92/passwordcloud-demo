# 使用 Node.js 18 镜像来构建前端项目
FROM node:18 AS build

# 设置工作目录
WORKDIR /app

# 复制项目文件
COPY . .

# 安装 pnpm
RUN npm install -g pnpm

# 设置环境变量
ENV VITE_APP_SERVER='http://10.35.124.130:3000'

# 安装依赖并打包项目
RUN pnpm install
RUN pnpm build

# 使用一个 Nginx 镜像来服务打包后的文件
FROM nginx:alpine

# 安装支持emoji的字体
RUN apk add --no-cache font-noto-emoji

# 复制打包后的文件到 Nginx 的 html 文件夹
COPY --from=build /app/dist /usr/share/nginx/html

# 复制 Nginx 配置文件到正确的位置
COPY nginx.conf /etc/nginx/nginx.conf

# 暴露端口
EXPOSE 8848

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]
