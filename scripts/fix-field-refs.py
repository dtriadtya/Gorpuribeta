import os
import glob

# Get all TypeScript files in app/api
files = glob.glob('app/api/**/*.ts', recursive=True)

for file_path in files:
    if not os.path.isfile(file_path):
        continue
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Track if changes were made
    original = content
    
    # Replace field: with lapangan: in include statements
    content = content.replace('include: {\n        field:', 'include: {\n        lapangan:')
    content = content.replace('include: {\n          field:', 'include: {\n          lapangan:')
    content = content.replace('field: {', 'lapangan: {')
    content = content.replace('field: true', 'lapangan: true')
    
    # Replace property accesses
    content = content.replace('.field?.', '.lapangan?.')
    content = content.replace('.field.', '.lapangan.')
    content = content.replace('(reservation as any).field', '(reservation as any).lapangan')
    content = content.replace('member.field', 'member.lapangan')
    
    # Write back if changed
    if content != original:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Updated: {file_path}')

print('\nDone!')
