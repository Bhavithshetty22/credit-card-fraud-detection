import glob, re

for path in glob.glob('frontend/src/**/*.*', recursive=True):
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
        for line in content.splitlines():
            if 'fetch(' in line or 'API_BASE' in line or '/api/' in line:
                print(f"{path}: {line.strip()}")
