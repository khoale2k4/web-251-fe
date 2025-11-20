# News Images Upload Folder

Thư mục này chứa các ảnh đại diện cho bài viết (news/posts).

## Cách hoạt động:

1. **Upload**: Khi user chọn ảnh trong form thêm/sửa bài viết, ảnh sẽ được upload ngay lập tức lên server
2. **Lưu trữ**: Ảnh được lưu vào `web-251-fe/assets/uploads/news/`
3. **Database**: Đường dẫn tương đối `assets/uploads/news/filename.jpg` được lưu vào database
4. **Hiển thị**: Frontend sử dụng đường dẫn từ database để hiển thị ảnh

## Định dạng hỗ trợ:
- JPG/JPEG
- PNG
- GIF
- WebP

## Giới hạn:
- Kích thước tối đa: 5MB (có thể cấu hình trong backend)
- Chỉ chấp nhận file ảnh

## Tên file:
- Tự động slug hóa từ tên gốc
- Thêm số suffix nếu trùng tên
- Ví dụ: `my-image.jpg`, `my-image-1.jpg`, `my-image-2.jpg`
