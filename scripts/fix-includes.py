import re
import os

files_to_fix = [
    'app/api/reservations/route.ts',
    'app/api/admin/reservations/route.ts',
    'app/api/reservations/[id]/payment/route.ts',
    'app/api/admin/members/[id]/route.ts'
]

for file_path in files_to_fix:
    if not os.path.exists(file_path):
        print(f'Skipped (not found): {file_path}')
        continue
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Replace in include statements - various indentation levels
    content = re.sub(r'include:\s*{([^}]*)\bfield:\s*{', r'include: {\1lapangan: {', content)
    content = re.sub(r'include:\s*{([^}]*)\bfield:\s*true', r'include: {\1lapangan: true', content)
    
    # Replace property accesses
    content = content.replace('member.field.', 'member.lapangan.')
    content = content.replace('reservation.field.', 'reservation.lapangan.')
    content = content.replace('(reservation as any).field', '(reservation as any).lapangan')
    
    if content != original:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'✓ Updated: {file_path}')
    else:
        print(f'- No changes: {file_path}')

print('\nDone!')
