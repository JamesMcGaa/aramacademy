import requests # to get image from the web
import shutil # to save it locally

count = 0

def get_champ_list():
    json = requests.get(
        'https://ddragon.leagueoflegends.com/cdn/%s/data/en_US/champion.json' % (get_current_patch())
        ).json()
    return json['data'].keys()

def get_current_patch():
    patch_list = requests.get('https://ddragon.leagueoflegends.com/api/versions.json')
    return patch_list.json()[0]

def get_url_from_champ(champ_name):
    return 'http://ddragon.leagueoflegends.com/cdn/%s/img/champion/%s.png' % (get_current_patch(), champ_name)

def get_about_page_url_from_champ(champ_name):
    return 'http://ddragon.leagueoflegends.com/cdn/img/champion/loading/%s_0.jpg' % (champ_name)



def save_champ_image(champ_name):
    url = get_url_from_champ(champ_name)
    print(url)
    filename = '../src/images/champ_icons/' + champ_name + '.png'

    # Open the url image, set stream to True, this will return the stream content.
    r = requests.get(url, stream = True)

    # Check if the image was retrieved successfully
    if r.status_code == 200:
        # Set decode_content value to True, otherwise the downloaded image file's size will be zero.
        r.raw.decode_content = True

        # Open a local file with wb ( write binary ) permission.
        with open(filename,'wb') as f:
            shutil.copyfileobj(r.raw, f)

        print('Image sucessfully Downloaded: ',filename)
        global count
        count+=1
    else:
        print('Image Couldn\'t be retreived')

def save_about_champ(champ_name):
    url = get_about_page_url_from_champ(champ_name)
    print(url)
    filename = '../src/images/about_page/' + champ_name + '_about.png'
    # Open the url image, set stream to True, this will return the stream content.
    r = requests.get(url, stream = True)

    # Check if the image was retrieved successfully
    if r.status_code == 200:
        # Set decode_content value to True, otherwise the downloaded image file's size will be zero.
        r.raw.decode_content = True

        # Open a local file with wb ( write binary ) permission.
        with open(filename,'wb') as f:
            shutil.copyfileobj(r.raw, f)

        print('Image sucessfully Downloaded: ',filename)
        global count
        count+=1
    else:
        print('Image Couldn\'t be retreived')
for champ in get_champ_list():
    save_champ_image(champ)

about_champs = ['MonkeyKing', 'Zed', 'Vayne', 'Draven', 'Ashe', 'Samira', 'Heimerdinger']
for champ in about_champs:
    save_about_champ(champ)

print('total champs successfully saved ' + str(count))
