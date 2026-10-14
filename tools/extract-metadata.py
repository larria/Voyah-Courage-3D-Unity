"""Extract this official IL2CPP v29 build's declared methods; not runtime proof."""
from pathlib import Path
import struct
import json

root = Path(__file__).resolve().parents[1]
archive = (root / 'unity-player/Build/ZY.data').read_bytes()
assert archive.startswith(b'UnityWebData1.0\0')
p = len(b'UnityWebData1.0\0')
end = struct.unpack_from('<I', archive, p)[0]
p += 4
entries = {}
while p < end:
    offset, size, length = struct.unpack_from('<III', archive, p)
    p += 12
    name = archive[p:p + length].decode()
    p += length
    assert offset + size <= len(archive)
    entries[name] = (offset, size)
offset, size = entries['Il2CppData/Metadata/global-metadata.dat']
data = archive[offset:offset + size]
assert struct.unpack_from('<II', data) == (0xFAB11BAF, 29)
headers = {'strings': 24, 'methods': 48, 'parameters': 88, 'fields': 96, 'types': 160}
def table(name):
    offset, size = struct.unpack_from('<II', data, headers[name])
    assert offset + size <= len(data)
    return offset, size

def record(name, index, fmt):
    offset, size = table(name)
    stride = struct.calcsize(fmt)
    assert 0 <= index and (index + 1) * stride <= size
    return struct.unpack_from(fmt, data, offset + index * stride)

def text(index):
    offset, size = table('strings')
    assert 0 <= index < size
    return data[offset + index:data.index(b'\0', offset + index, offset + size)].decode()

types = [record('types', i, '<7iI8i8H2I') for i in range(table('types')[1] // 88)]
def name(t):
    return '.'.join(filter(None, [text(t[1]), text(t[0])]))
type_names = {t[2]: name(t) for t in types}
result = {}
for i, t in enumerate(types):
    if name(t) not in ['Configurator.API', 'Configurator.CarConfigurator', 'Common.Car.DoorID']:
        continue
    methods = []
    for j in range(t[9], t[9] + t[16]):
        m = record('methods', j, '<5iI4H')
        assert m[1] == i
        params = []
        for k in range(m[9]):
            param = record('parameters', m[3] + k, '<iIi')
            params.append({'name': text(param[0]), 'type': type_names.get(param[2], f'UnresolvedTypeIndex:{param[2]}')})
        methods.append({'name': text(m[0]), 'parameters': params, 'token': hex(m[5])})
    fields = []
    for j in range(t[8], t[8] + t[18]):
        f = record('fields', j, '<iiI')
        fields.append({'name': text(f[0]), 'typeIndex': f[1]})
    result[name(t)] = {'methods': methods, 'fields': fields}
(root / 'verification/runtime-metadata.json').write_text(json.dumps(result, indent=2, ensure_ascii=False))
print('Saved metadata declarations, not verified runtime capabilities.')
