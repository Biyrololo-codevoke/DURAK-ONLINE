import os

n = 0
c = 0
k = 0

def analyze_file(file_path):
    global n, c, k
    _n = 0
    _c = 0
    _k = 0
    with open(file_path, 'r') as file:
        for line in file:
            if line.strip() == '':
                _n += 1
            elif line.startswith('#') or line.startswith('/'):
                _c += 1
            else:
                _k += 1
    print(f"file: {file_path}")
    print(f"empty: {_n}, comments: {_c}, regular: {_k}")
    return _n, _c, _k

def analyze_folder(folder_name):
    global n, c, k
    for root, dirs, files in os.walk(folder_name):
        for file in files:
            file_path = os.path.join(root, file)
            _n, _c, _k = analyze_file(file_path)
            n += _n
            c += _c
            k += _k

if __name__ == "__main__":
    folder_name = input("Enter folder name: ")
    analyze_folder(folder_name)
    print(f"Total: empty: {n}, comments: {c}, regular: {k}")
