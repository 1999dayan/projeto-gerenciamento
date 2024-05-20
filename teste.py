import requests

data = {
    'data': '2024-05-16T00:00:00.000Z',
    'Turma': '6642d3ec741ea4d0d2e6dde1',
    'campus': '6642d3a7741ea4d0d2e6ddba',
    'professor': '664271fd3dc2b1afa17d3d5f', 
}

response = requests.get('http://localhost:4000/presenca', params=data)
print(response)
print(response.text)