# Hướng dẫn Deploy Dự án với XAMPP

## Yêu cầu
- Đã cài đặt **XAMPP** trên máy.
- Có quyền truy cập thư mục `htdocs` của XAMPP.

## Các bước triển khai

1. **Khởi chạy XAMPP Server**
    - Trên macOS/Linux:
        ```
        sudo /Applications/XAMPP/xamppfiles/xampp start
        ```
    - Trên Windows: mở **XAMPP Control Panel** và nhấn **Start** cho `Apache` (và `MySQL` nếu cần).

2. **Copy dự án vào thư mục htdocs**
    - Di chuyển toàn bộ thư mục dự án vào:
        ```
        ./XAMPP/xamppfiles/htdocs/
        ```

    Ví dụ:
        ```
        cp -r <ten-thu-muc-du-an> /Applications/XAMPP/xamppfiles/htdocs/
        ```

3. **Truy cập dự án trên trình duyệt**

    - Mở trình duyệt và nhập:
        ```
        http://localhost/<ten-thu-muc-du-an>
        ```

    - Nếu dự án có file index.php hoặc index.html, nó sẽ được load mặc định.

## Lưu ý

    - Nếu dự án dùng database, cần import file .sql vào MySQL thông qua phpMyAdmin tại:
        ```
        http://localhost/phpmyadmin
        ```

    - Kiểm tra file cấu hình (nếu có) để cập nhật lại thông tin kết nối database (host, username, password, dbname).

## Cấu trúc thư mục mẫu sau khi copy vào XAMPP
        ```
        /Applications/XAMPP/xamppfiles/htdocs/
        └── <ten-thu-muc-du-an>/
            ├── index.php
            ├── css/
            ├── js/
            ├── images/
            └── ...
        ```