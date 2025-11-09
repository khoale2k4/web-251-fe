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

    Ví dụ MacOS:
        ```
        cp -r ./web-251-fe /Applications/XAMPP/xamppfiles/htdocs/
        ```

3. **Truy cập dự án trên trình duyệt**

- Mở trình duyệt và nhập:
    ```
    http://localhost/web-251-fe
    ```
