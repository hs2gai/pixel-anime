"""公開用のサイトを dist/ に書き出す。publish.json の public に載った作品だけを入れる。

    python build.py

- 非公開の作品は、HTML・サムネイル・一覧のカードを dist/ に入れない
- カードがなくなった欄（作家・本・巻・教科の見出し）も一覧から消す
- シリーズの「前の話・次の話」も非公開の話へはつながない（engine/core.js の PUBLIC_WORKS を置き換える）
- 入れるのは作品・engine/・cast/・サムネイル・一覧・_headers だけ。管理画面（admin.html）や開発用のファイルは入れない
"""
import json
import shutil
from pathlib import Path

from bs4 import BeautifulSoup

ROOT = Path(__file__).parent
DIST = ROOT / 'dist'
PUBLISH = ROOT / 'publish.json'
COPY_DIRS = ['engine', 'cast']   # 作品が ../engine/ ../cast/ から読む。丸ごと入れる
PUBLIC_LINE = 'const PUBLIC_WORKS = null;'
# 一覧の見出しの深さ。浅い見出しは、自分より深い中身が続くときだけ残す
RANK = {'h2': 1, 'book': 2, 'vol': 3, 'grid': 4}


def load_public():
    return set(json.loads(PUBLISH.read_text(encoding='utf-8'))['public'])


def save_public(names):
    data = {'public': sorted(names)}
    PUBLISH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def all_works():
    return sorted(p.name for p in (ROOT / 'works').glob('*.html'))


def card_work(card):
    """カードがつなぐ作品のファイル名（works/xxx.html の xxx.html）"""
    return card.select_one('a.name')['href'].split('/')[-1]


def rank(el):
    if el.name == 'h2':
        return RANK['h2']
    classes = el.get('class') or []
    return next((RANK[c] for c in ('book', 'vol', 'grid') if c in classes), None)


def prune_headings(parent):
    """中身のなくなった見出しを消す。後ろから見て、次に残る要素より浅い見出しだけ残す"""
    below = None   # すぐ後ろに残っている要素の深さ（見出しでも欄でもなければ None）
    for el in reversed(parent.find_all(recursive=False)):
        r = rank(el)
        if r is None:
            below = None
        elif r == RANK['grid'] and not el.select('.card'):
            el.decompose()
        elif r < RANK['grid'] and (below is None or below <= r):
            el.decompose()
        else:
            below = r


def build_index(public):
    soup = BeautifulSoup((ROOT / 'index.html').read_text(encoding='utf-8'), 'html.parser')
    for script in soup.select('script[data-local]'):   # 手元で publish.json を読んで外す処理。公開版ではここで外し済み
        script.decompose()
    for card in soup.select('article.card'):
        if card_work(card) not in public:
            card.decompose()
    for group in soup.select('section.group'):
        prune_headings(group)
        if not group.select('.card'):
            group.decompose()
    kyozai = soup.select_one('#p-kyozai')   # 教材の欄（あれば）
    if kyozai:
        prune_headings(kyozai)
    return str(soup)


def build():
    public = load_public()
    works = [w for w in all_works() if w in public]
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir()
    for d in COPY_DIRS:
        shutil.copytree(ROOT / d, DIST / d)
    core = DIST / 'engine' / 'core.js'
    src = core.read_text(encoding='utf-8')
    assert src.count(PUBLIC_LINE) == 1, f'{core} に「{PUBLIC_LINE}」の行が 1 つだけあるはず'
    core.write_text(src.replace(PUBLIC_LINE, f'const PUBLIC_WORKS = {json.dumps(works)};'), encoding='utf-8')
    (DIST / 'works').mkdir()
    (DIST / 'thumbs' / 'en').mkdir(parents=True)
    for w in works:
        shutil.copy2(ROOT / 'works' / w, DIST / 'works' / w)
        # サムネイル（thumbs/en/ は英語版の一覧で使う、英語の字幕の絵）
        for sub in ('', 'en'):
            thumb = ROOT / 'thumbs' / sub / (Path(w).stem + '.jpg')
            if thumb.exists():
                shutil.copy2(thumb, DIST / 'thumbs' / sub / thumb.name)
    (DIST / 'index.html').write_text(build_index(public), encoding='utf-8')
    shutil.copy2(ROOT / '_headers', DIST / '_headers')   # Cloudflare が返すレスポンスヘッダー
    return {'public': len(works), 'private': len(all_works()) - len(works)}


if __name__ == '__main__':
    r = build()
    print(f'dist/ に書き出しました：公開 {r["public"]} 作品・非公開 {r["private"]} 作品')
