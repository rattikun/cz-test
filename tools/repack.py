import re
import os
import json
import base64
import gzip

# Maps each UUID (as used in the bundle) to its source file path
UUID_TO_FILE = {
    # lib
    'a5b17c70-4c25-4eb8-bacc-046f4fa76040': 'src/lib/react.js',
    'c63bff25-00c2-4bdb-b66a-d9e5d160a002': 'src/lib/react-dom.js',
    '21179815-35b1-4edc-a964-66a4e6541cf6': 'src/lib/babel.js',
    # app
    '2d582469-a9d7-430f-b886-71ec7e1be9fa': 'src/app/icons.jsx',
    '1d8fe367-06f1-435a-862f-e13b3118701f': 'src/app/data.jsx',
    '16ac3cce-014a-419a-a480-5478e45b74c6': 'src/app/components.jsx',
    '0eb71553-3901-4248-9f3c-28b2039338af': 'src/app/tweaks-panel.jsx',
    '671550ee-89da-4247-88d5-20553d617711': 'src/app/search.jsx',
    'fdf33a7e-1020-4183-a028-03533eac6a74': 'src/app/workflow.jsx',
    '99540af9-23ab-4f9f-adda-f8f998c292ba': 'src/app/recommendations.jsx',
    'fa25ce5e-8fc5-4b3b-bf2a-48862b4809ba': 'src/app/ranking.jsx',
    '6557d8a0-e06b-4d98-85e1-aa306ea9ea5e': 'src/app/viz.jsx',
    '3a49b36c-ea5c-48af-8ac1-9dbc2a2c25ca': 'src/app/app.jsx',
    # fonts (UUID-named .bin files in src/fonts/)
    'a46d0524-c17a-4fa7-8215-c6c6db60017a': 'src/fonts/a46d0524-c17a-4fa7-8215-c6c6db60017a.bin',
    'e599bc10-632b-421e-9a69-2e840ef93ddc': 'src/fonts/e599bc10-632b-421e-9a69-2e840ef93ddc.bin',
    'c0d30b5c-29b6-46ad-b8e9-3871b74c0cb1': 'src/fonts/c0d30b5c-29b6-46ad-b8e9-3871b74c0cb1.bin',
    '404a9c39-4696-400e-9a77-7a08d54c53dc': 'src/fonts/404a9c39-4696-400e-9a77-7a08d54c53dc.bin',
    'cea115c1-a43c-42e3-a9ca-555b7d853bca': 'src/fonts/cea115c1-a43c-42e3-a9ca-555b7d853bca.bin',
    '4b79062e-f3f4-453c-bb27-659b9bd59f3a': 'src/fonts/4b79062e-f3f4-453c-bb27-659b9bd59f3a.bin',
    '709dddc5-7874-4fb4-bf24-8ee56236d799': 'src/fonts/709dddc5-7874-4fb4-bf24-8ee56236d799.bin',
    'a9777998-e9f1-4876-87ef-60ddc0c7e3a6': 'src/fonts/a9777998-e9f1-4876-87ef-60ddc0c7e3a6.bin',
    '11b7252e-5db1-4021-96d7-8c5d8a507830': 'src/fonts/11b7252e-5db1-4021-96d7-8c5d8a507830.bin',
    '675a2bc6-1341-469c-bb90-5d75f0b4a1a7': 'src/fonts/675a2bc6-1341-469c-bb90-5d75f0b4a1a7.bin',
    'd271d175-3de7-4217-9baf-bc555dbc228e': 'src/fonts/d271d175-3de7-4217-9baf-bc555dbc228e.bin',
    '6e55d907-c159-44b3-921f-3f8b52732946': 'src/fonts/6e55d907-c159-44b3-921f-3f8b52732946.bin',
    'fb2bf2b5-19d8-492e-9144-6e4d718983ad': 'src/fonts/fb2bf2b5-19d8-492e-9144-6e4d718983ad.bin',
    'a7f121e2-1f50-46ca-b404-10b99d49d7a4': 'src/fonts/a7f121e2-1f50-46ca-b404-10b99d49d7a4.bin',
    '5cc7c320-57b0-4d78-8227-9ee8df6ce142': 'src/fonts/5cc7c320-57b0-4d78-8227-9ee8df6ce142.bin',
}

TEXT_EXTENSIONS = {'.js', '.jsx', '.css', '.html', '.svg', '.json'}


def repack():
    src_dir = 'src'
    html_path = 'tabletop-ai.html'
    out_path = 'tabletop-ai.html'

    with open(os.path.join(src_dir, 'manifest_meta.json'), 'r', encoding='utf-8') as f:
        meta = json.load(f)

    manifest = {}
    for uuid, info in meta.items():
        mime = info['mime']
        compressed = info.get('compressed', False)

        filepath = UUID_TO_FILE.get(uuid)
        if not filepath or not os.path.exists(filepath):
            raise FileNotFoundError(f"Cannot find source file for UUID {uuid} (expected: {filepath})")

        ext = os.path.splitext(filepath)[1].lower()
        if ext in TEXT_EXTENSIONS:
            with open(filepath, 'r', encoding='utf-8') as f:
                raw_bytes = f.read().encode('utf-8')
        else:
            with open(filepath, 'rb') as f:
                raw_bytes = f.read()

        final_bytes = gzip.compress(raw_bytes, compresslevel=9) if compressed else raw_bytes

        manifest[uuid] = {
            'mime': mime,
            'compressed': compressed,
            'data': base64.b64encode(final_bytes).decode('ascii'),
        }

    with open(os.path.join(src_dir, 'template.html'), 'r', encoding='utf-8') as f:
        template_html = f.read()
    template_html = re.sub(r' integrity="sha384-[^"]*"', '', template_html)

    def json_safe(s):
        encoded = json.dumps(s, ensure_ascii=False, separators=(',', ':'))
        return encoded.replace('</', '<\\/')

    manifest_json = json_safe(manifest)
    template_json = json_safe(template_html)

    with open(html_path, 'r', encoding='utf-8') as f:
        html = f.read()

    manifest_open_tag = '<script type="__bundler/manifest">'
    prefix_end = html.index(manifest_open_tag)
    prefix = html[:prefix_end]
    prefix = re.sub(r' integrity="sha384-[^"]*"', '', prefix)

    new_html = (
        prefix
        + f'<script type="__bundler/manifest">{manifest_json}</script>\n\n  '
        + f'<script type="__bundler/template">{template_json}</script>\n\n\n</body>\n</html>'
    )

    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(new_html)

    print(f"Repacked {len(manifest)} assets into {out_path}")


if __name__ == '__main__':
    repack()
