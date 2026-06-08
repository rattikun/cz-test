import os
import json
import base64
import gzip

def pack():
    html_path = 'tabletop-ai.html'
    src_dir = 'src'
    
    print(f"Reading manifest metadata and template...")
    with open(os.path.join(src_dir, 'manifest_meta.json'), 'r', encoding='utf-8') as f:
        meta = json.load(f)
        
    with open(os.path.join(src_dir, 'template.html'), 'r', encoding='utf-8') as f:
        template_content = f.read()

    new_manifest = {}
    
    for uuid, entry in meta.items():
        mime = entry.get('mime', '')
        compressed = entry.get('compressed', False)
        
        # Determine original file extension
        ext = 'bin'
        if 'javascript' in mime or 'js' in mime:
            ext = 'js'
        elif 'css' in mime:
            ext = 'css'
        elif 'html' in mime:
            ext = 'html'
        elif 'svg' in mime:
            ext = 'svg'
        elif 'json' in mime:
            ext = 'json'
        elif 'png' in mime:
            ext = 'png'
        elif 'jpeg' in mime or 'jpg' in mime:
            ext = 'jpg'
            
        filename = f"{uuid}.{ext}"
        filepath = os.path.join(src_dir, filename)
        
        if not os.path.exists(filepath):
            print(f"Error: Required file {filepath} not found.")
            return
            
        # Read the file
        if ext in ['js', 'css', 'html', 'svg', 'json']:
            with open(filepath, 'r', encoding='utf-8') as f:
                data_bytes = f.read().encode('utf-8')
        else:
            with open(filepath, 'rb') as f:
                data_bytes = f.read()
                
        # Compress if needed
        if compressed:
            # Use gzip with compression level 9 for maximum compression
            data_bytes = gzip.compress(data_bytes, compresslevel=9)
            
        # Base64 encode
        b64_str = base64.b64encode(data_bytes).decode('utf-8')
        
        new_manifest[uuid] = {
            'mime': mime,
            'compressed': compressed,
            'data': b64_str
        }
        print(f"Packed {filename} -> manifest ({len(b64_str)} base64 chars)")

    # Read the master HTML file to replace contents
    with open(html_path, 'r', encoding='utf-8') as f:
        html_content = f.read()

    # Re-serialize manifest and template to match the exact single-line JSON structure in bundler script
    manifest_json = json.dumps(new_manifest, separators=(',', ':'))
    template_json = json.dumps(template_content, separators=(',', ':'))

    # Replace manifest using safe string slice
    print("Injecting manifest...")
    start_tag = '<script type="__bundler/manifest">'
    end_tag = '</script>'
    
    start_idx = html_content.find(start_tag)
    if start_idx == -1:
        print("Error: Could not find opening manifest script tag in HTML.")
        return
        
    content_start = start_idx + len(start_tag)
    end_idx = html_content.find(end_tag, content_start)
    if end_idx == -1:
        print("Error: Could not find closing manifest script tag in HTML.")
        return
        
    html_content = html_content[:content_start] + manifest_json + html_content[end_idx:]

    # Replace template using safe string slice
    print("Injecting template...")
    start_tag_tpl = '<script type="__bundler/template">'
    
    start_idx_tpl = html_content.find(start_tag_tpl)
    if start_idx_tpl == -1:
        print("Error: Could not find opening template script tag in HTML.")
        return
        
    content_start_tpl = start_idx_tpl + len(start_tag_tpl)
    end_idx_tpl = html_content.find(end_tag, content_start_tpl)
    if end_idx_tpl == -1:
        print("Error: Could not find closing template script tag in HTML.")
        return
        
    html_content = html_content[:content_start_tpl] + template_json + html_content[end_idx_tpl:]

    # Write back to standalone HTML
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html_content)

    print(f"Repacking complete! Updated {html_path} ({os.path.getsize(html_path)} bytes)")

if __name__ == '__main__':
    pack()
