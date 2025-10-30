import os

def print_tree(path, prefix=""):
    # Lấy danh sách các tệp và thư mục trong đường dẫn
    items = sorted(os.listdir(path))
    for i, name in enumerate(items):
        if name in ['.git']:
            continue
        full_path = os.path.join(path, name)
        connector = "└── " if i == len(items) - 1 else "├── "
        print(prefix + connector + name)
        if os.path.isdir(full_path):
            extension = "    " if i == len(items) - 1 else "│   "
            print_tree(full_path, prefix + extension)

# Ví dụ: in cấu trúc thư mục hiện tại
print_tree(".")
