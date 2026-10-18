"""開発用のローカルサーバー。編集がすぐ反映されるよう、ブラウザにキャッシュさせない。

    python serve.py                  # http://localhost:8765/（この PC からだけ開ける）
    python serve.py 8000             # ポートを指定
    python serve.py 8765 0.0.0.0     # 同じネットワークの端末（スマホなど）からも開く。信頼できるネットワークでだけ使う

管理画面（http://localhost:8765/admin.html）の API も受け持つ。書き換える API は、この PC で開いた管理画面からだけ受け付ける。
    GET  /api/publish   作品のファイル名の一覧と、公開する作品
    POST /api/publish   {"public": [...]} を publish.json に保存する
    POST /api/build     公開用のサイトを dist/ に書き出す（build.py）

守り：
- 書き換える API は、接続元がこの PC で、Host がこの PC の名前、Origin（ブラウザが付ける）が同じサイトのときだけ受け付ける
  （ほかのサイトを開いたブラウザから裏で送られる要求（CSRF）や、DNS リバインディングを断る）
- .git/ や .env のような、名前が「.」で始まるファイル・フォルダは返さない
"""
import json
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit

import build

LOCAL = {'127.0.0.1', '::1'}
LOCAL_HOSTS = {'localhost', '127.0.0.1', '[::1]'}


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def send_json(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def hidden(self):
        """名前が「.」で始まるファイル・フォルダ（.git/ .env など）への要求か"""
        return any(part.startswith('.') for part in unquote(urlsplit(self.path).path).split('/'))

    def from_admin(self):
        """この PC で開いた管理画面からの要求か"""
        host = self.headers.get('Host', '')
        origin = self.headers.get('Origin')
        return (self.client_address[0] in LOCAL
                and host.rsplit(':', 1)[0] in LOCAL_HOSTS
                and (origin is None or origin == f'http://{host}'))

    def do_GET(self):
        if self.hidden():
            return self.send_error(404)
        if self.path == '/api/publish':
            return self.send_json({'works': build.all_works(), 'public': sorted(build.load_public())})
        super().do_GET()

    def do_HEAD(self):
        if self.hidden():
            return self.send_error(404)
        super().do_HEAD()

    def do_POST(self):
        if not self.from_admin():
            return self.send_json({'error': 'この PC で開いた管理画面からだけ使えます'}, 403)
        if self.path == '/api/publish':
            data = json.loads(self.rfile.read(int(self.headers.get('Content-Length', 0))))
            names = data.get('public') if isinstance(data, dict) else None
            if not isinstance(names, list) or not all(isinstance(n, str) for n in names):
                return self.send_json({'error': '{"public": ["作品.html", ...]} の形で送ってください'}, 400)
            unknown = set(names) - set(build.all_works())
            if unknown:
                return self.send_json({'error': f'works/ にない作品：{sorted(unknown)}'}, 400)
            build.save_public(names)
            return self.send_json({'public': sorted(build.load_public())})
        if self.path == '/api/build':
            return self.send_json(build.build())
        self.send_json({'error': 'not found'}, 404)


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
    host = sys.argv[2] if len(sys.argv) > 2 else '127.0.0.1'
    handler = partial(NoCacheHandler, directory=str(Path(__file__).parent))
    print(f'http://localhost:{port}/ at {host}（管理画面 http://localhost:{port}/admin.html）')
    ThreadingHTTPServer((host, port), handler).serve_forever()
