# Sử dụng hình ảnh Node.js chính thức
FROM node:18

# Tạo thư mục làm việc bên trong container
WORKDIR /app

# Sao chép package.json và package-lock.json
COPY package*.json ./

# Cài đặt các phụ thuộc
RUN npm install

# Sao chép toàn bộ mã nguồn vào container
COPY . .

# Cấu hình port mà ứng dụng sẽ sử dụng
EXPOSE 3000

# Chạy ứng dụng trong chế độ phát triển
CMD ["npm", "run", "start:dev"]