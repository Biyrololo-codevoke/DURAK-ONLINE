import os

n = 0
c = 0
k = 0

def analyze_file(file_path):
    global n, c, k
    _n = 0
    _c = 0
    _k = 0
    try:
        with open(file_path, 'r') as file:
            _is = []
            i = 0
            for line in file:
                if "logger.info" in line:
                    _is.append(i)
                i += 1
            if len(_is) > 1:
                print(file_path)
                print(", ".join(map(str, _is)))
            
    except Exception:
        pass
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
    while True:
        try:
            folder_name = input("Enter folder name: ")
            analyze_folder(folder_name)
        except InterruptedError:
            break

