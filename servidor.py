# Servidor local para desenvolvimento: igual ao "python -m http.server",
# mas pede ao navegador para não guardar cópias antigas dos arquivos.
import http.server
import sys


class SemCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()


porta = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
http.server.ThreadingHTTPServer(('', porta), SemCache).serve_forever()
