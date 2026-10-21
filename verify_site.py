"""Static checks for the TidiReis site; run with `python verify_site.py`."""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
import json
import re

from PIL import Image


ROOT = Path(__file__).parent


class Document(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.refs = []
        self.tabs = []
        self.sections = []

    def handle_starttag(self, tag, attrs):
        data = dict(attrs)
        if "id" in data:
            self.ids.append(data["id"])
        if tag == "section":
            self.sections.append(data.get("id"))
        if data.get("role") == "tab":
            self.tabs.append(data)
        for attr in ("href", "src"):
            if data.get(attr):
                self.refs.append(data[attr])


def cnpj_valid(number):
    digits = [int(value) for value in re.sub(r"\D", "", number)]
    if len(digits) != 14 or len(set(digits)) == 1:
        return False

    def check(values, weights):
        result = 11 - sum(a * b for a, b in zip(values, weights)) % 11
        return 0 if result >= 10 else result

    return (digits[12] == check(digits[:12], [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
            and digits[13] == check(digits[:13], [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]))


def main():
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    assert "TidiReis Soluções Digitais" in html
    assert "nexus" not in html.lower()
    document = Document()
    document.feed(html)
    counts = Counter(document.ids)
    assert not [key for key, value in counts.items() if value > 1], "Duplicate HTML id"
    for reference in document.refs:
        if reference.startswith("#"):
            assert reference[1:] in counts, f"Missing anchor: {reference}"
        elif not re.match(r"^[a-z][a-z0-9+.-]*:", reference):
            assert (ROOT / reference.split("?", 1)[0]).exists(), f"Missing asset: {reference}"
    showcase_tabs = [tab for tab in document.tabs if tab.get("aria-controls") == "demo-panel"]
    lab_tabs = [tab for tab in document.tabs if tab.get("aria-controls") == "labPreview"]
    assert len(showcase_tabs) == 6
    assert len(lab_tabs) == 5
    assert len(re.findall(r'class="service-card', html)) == 6
    assert len(re.findall(r'name="service"', html)) == 8
    assert cnpj_valid("69.340.664/0001-04")

    manifest = json.loads((ROOT / "manifest.webmanifest").read_text(encoding="utf-8"))
    assert manifest["display"] == "standalone"
    sizes = set()
    for icon in manifest["icons"]:
        path = ROOT / icon["src"]
        assert path.exists()
        with Image.open(path) as image:
            size = f"{image.width}x{image.height}"
            assert size == icon["sizes"]
            sizes.add(size)
    assert {"192x192", "512x512"}.issubset(sizes)
    shortcuts = {"#" + item["url"].split("#", 1)[-1] for item in manifest.get("shortcuts", [])}
    assert {"#servicos", "#tecnologia", "#orcamento", "#contato"}.issubset(shortcuts)
    maskable = [icon for icon in manifest["icons"] if icon.get("purpose") == "maskable"]
    assert maskable, "Missing maskable icon"
    with Image.open(ROOT / maskable[0]["src"]) as image:
        alpha = image.getchannel("A")
        visible = alpha.point(lambda value: 255 if value > 32 else 0).getbbox()
        assert visible and visible[0] > image.width * .15 and visible[2] < image.width * .85
        assert visible[1] > image.height * .15 and visible[3] < image.height * .85
    assert Image.open(ROOT / "assets/og-image.jpg").size == (1200, 630)
    assert (ROOT / "offline.html").exists()
    assert "Conexão interrompida." in (ROOT / "offline.html").read_text(encoding="utf-8")
    assert "Página não encontrada." in (ROOT / "404.html").read_text(encoding="utf-8")
    assert (ROOT / "privacidade.html").exists()
    assert (ROOT / "robots.txt").exists()
    assert "SKIP_WAITING" in (ROOT / "sw.js").read_text(encoding="utf-8")
    assert "Serviço: " in (ROOT / "advanced.js").read_text(encoding="utf-8")
    ignored = set((ROOT / ".vercelignore").read_text(encoding="utf-8").splitlines())
    runtime = list(ROOT.glob("*.html")) + list(ROOT.glob("*.css")) + [
        ROOT / name for name in ("script.js", "advanced.js", "showcase.js", "sw.js", "manifest.webmanifest")
    ]
    for source in runtime:
        for asset in set(re.findall(r"assets/[\w.-]+", source.read_text(encoding="utf-8"))):
            assert (ROOT / asset).is_file(), f"Missing runtime asset: {asset} ({source.name})"
            assert asset not in ignored, f"Runtime asset excluded from Vercel: {asset}"
    vercel = json.loads((ROOT / "vercel.json").read_text(encoding="utf-8"))
    assert vercel["framework"] is None and vercel["outputDirectory"] == "."
    assert vercel["buildCommand"] == ""
    print(f"OK: {len(document.sections)} seções, 6 serviços, 6 conceitos, 5 experiências de laboratório, 8 opções de orçamento, links locais, manifest e CNPJ.")


if __name__ == "__main__":
    main()
