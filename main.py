import os

def generate_tree(dir_path, prefix='', ignore_dirs=None, output_file=None):
    if ignore_dirs is None:
        # Danh sách các thư mục muốn bỏ qua (bạn có thể thêm bớt tùy ý)
        ignore_dirs = {'.git', '.idea', '.vscode', '__pycache__', 'node_modules', 'vendor', 'dist', 'build'}

    # Lấy danh sách file và folder, sắp xếp tên
    try:
        items = os.listdir(dir_path)
        items.sort()
    except PermissionError:
        return

    # Lọc bỏ các thư mục nằm trong ignore_dirs
    items = [i for i in items if i not in ignore_dirs]
    
    # Đếm số lượng để xử lý item cuối cùng
    count = len(items)
    
    for index, item in enumerate(items):
        path = os.path.join(dir_path, item)
        is_last = (index == count - 1)
        
        # Chọn ký tự nối
        connector = '└── ' if is_last else '├── '
        
        # In ra màn hình
        line = f"{prefix}{connector}{item}"
        print(line)
        
        # Ghi vào file nếu có yêu cầu
        if output_file:
            output_file.write(line + '\n')
        
        # Nếu là thư mục thì đệ quy (gọi lại hàm) để đi sâu vào trong
        if os.path.isdir(path):
            extension = '    ' if is_last else '│   '
            generate_tree(path, prefix + extension, ignore_dirs, output_file)

if __name__ == "__main__":
    # Lấy đường dẫn thư mục hiện tại
    current_dir = os.getcwd()
    
    print(f"Đang quét cấu trúc thư mục: {current_dir}\n")
    print(os.path.basename(current_dir) + "/")
    
    # Mở file để lưu kết quả
    with open('structure.txt', 'w', encoding='utf-8') as f:
        f.write(os.path.basename(current_dir) + "/\n")
        generate_tree(current_dir, output_file=f)
        
    print("\n------------------------------------------------")
    print("✅ Đã xuất cấu trúc thành công!")
    print("📁 Kết quả đã được lưu vào file: structure.txt")