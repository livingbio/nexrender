# AE render for glia

## Introduction

藉由nexrender這個套件，我們可以快速地產製以After effects生成的影片，
基本的流程建立於在node的環境中導入nexrender，並以JSON檔的方式INPUT我們目標改變的資料。
進而達到可以順應資料需求，呈現對應INPUT數值的影片內容。

## Nexrender

### Brief

在進行AE render的流程時，請務必先熟悉nexrender原生套件的文檔:
https://github.com/inlife/nexrender/tree/master/packages
總結來說，nexrender使我們在影片產製時多了一個選項，以JSON格式的程式碼代入並渲染為After effects專案中的內容。
使用上只要使用npm下載套件，並了解其特定的INPUT格式就可以上手，在之後段落我也會大略剖析介紹。

### Caveat

請務必注意的是，為了使這個套件更理想地符合我們的需求，套件的原始碼有些微的修改，以提升作業流程的品質。
因此在此提供提醒些許的細節必須額外注意，在之後的段落也會詳細闡述，但大多的作業結構依然與原生套件無異；
熟悉上段落提供的文檔將能幫助整體流程順利進行。

## How to Start
### After effects

首先，請確認你的機台有妥善地安裝After Effects才能使影片產製的工作順利進行，以及有npm的發開環境。

### Installation

請用以下程式碼在你的node環境中導入因應我們需求客製化後的Package。
```
npm install --save action-move-glia aerender-core-glia
```

### Usage

在確認本地環境安裝好套件後，即可在文件中導入套件。

```js
// render.js

const { init, render } = require('aerender-core-glia')
const myJobJson = require('./whereMyJsonLocated/myJsonFile')

const settings = init({
    logger: console,
})

const main = async () => {
    const result = await render(myJobJson, settings)
}

main().catch(console.error);

```
在同一份文件中你便可以導入JSON檔案，為Rendering步驟做細節上的設定，請參考之後段落了解檔案格式。

#### Run the file

在ComandLine中以node.js執行這個檔案就會開始Rendering的步驟。

```
node your-render-file.js
```

### JSON structure

在大體結構分為Template, assets, action三個Object，大致上結構非常分明了解上並不困難。

Template讓你導入After effect專案，並指明產製結果後影片格式、命名和產製模組。

Asset使你能指定前者AE專案中的Composition以及其中的layer，以不同方式改變其性質，
這會是你作業上必須專注的地方，你必須和負責AE project的人士妥善溝通並遵照標準的命名規格，
並且要對AE物件屬性有一定的了解，可以參考http://docs.aenhancers.com/introduction/objectmodel/ 以幫助操作。

Action是關於Rendering流程前後，你能導入其他package做出些額外的動作以處理結果文件。
以我們使用的狀況為例，我們導入的action-move-glia這個package在渲染後將檔案從工作目錄中移動至我們指名的文件夾，僅只如此而已。
在目前使用上這不會是我們Focus的地方，只要使用action-move-glia並指明目標資料夾即可。

## JSON structure in depth

### File protocal

在處理文件時，有src的Key和value請依照nexrender的file protocol以正確導入檔案。
預設的有file, http, https, data四種，以下引用原文件範例。

#### Examples

Here are some examples of src paths:

```
file:///home/assets/image.jpg
file:///d:/projects/project.aep
file://$ENVIRONMENT_VARIABLE/image.jpg

http://somehost.com:8080/assets/image.jpg?key=foobar
https://123.123.123.123/video.mp4

data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==
data:text/plain;charset=UTF-8,some%20data:1234,5678
```

### Template

Template是渲染過程中必需的物件以作為渲染的基礎，Glia的package中修改幾項細節，這也是和原生套件不盡相同的地方，
因此在閱覽原文件後也請務必注意幾點。

```json
{
"template": {
        "src": "file:///C:/where_my_ae_project_located/myAEproject.aep", // 在此導入你目標AE Project文件，並遵照file protocoal擺放Prefix。
        "composition": "all", /* composition是AE Project中一個物件，我們必須先指名它才能修改底下的layer，此處的value將設定整個渲染過程composition的預設值，假如底下的asset沒有指定哪個composition做修改的話，將以此處的value為準 */
        "outputModule": "someOutputModule", /* 在AE project中你能客製化你的輸出模組，這關乎你的影片格式、輸出品質等等，前提是負責AE的人士必須手動創建個別的模組並與你告知你模組名稱，並在此處value加以指定 */
        "outputExt": ".mov", // 出產影片結果副檔名
        "name": "result" // 出產影片結果名稱
    },
    ........
}
```

### Asset

與原生套件有著一致規範，同樣地你必須遵照File Protocoal引用檔案，並且熟悉after effects上的物件屬性，以下我也將提供部分解釋範例。

### Example

```json
{
    "assets": [
        {
            "src": "file:///home/assets/video.mp4",
            "type": "video", // 指名此為影片檔類別
            "layerIndex": "1",
            "composition": "someComp" // 指名目標composition，可以以此指定目標compisition而非Template上的預設值
        },
        {
            "src": "https://example.com/assets/image.jpg", // 文件連結
            "type": "image", // 指名此為圖片類別
            "layerName": "MyNicePicture.jpg" // 以名稱指名composition下的目標Layer，在此物件無設定composition的情況下，將以Template的設定為準
        },
        {
            "src": "file:///home/assets/audio.mp3",
            "type": "audio", // 指名此為音源檔類別
            "layerIndex": 15 // 以index指名composition下的目標Layer，在此物件無設定composition的情況下，將以Template的設定為準
        },
        {
            "type": "data", // 指名此為data類別，可以修改after effect物件屬性，如位置，透明度，文字內容等等
            "layerIndex": "1",
            "composition": "somecomp",
            "property": "Source Text", // after effect物件上的文字屬性
            "value": "someText" // 輸入value以加以修改                
        },
        {
            "type": "data",
            "layerName": "background",
            "property": "startTime",  // AE的物件屬性，指名該layer開始出現的時間點，與其相反的outPoint指定layer出場的時機
            "value": "30" // 以秒數為單位，此處指名該layer於三十秒開始出現
        },
        {
            "type": "data",
            "layerIndex": 15,
            "property": "Scale",
            "expression": "[time * 0.1, time * 0.1]"
        },
        {
            "src": "http://example.com/scripts/myscript.jsx",
            "type": "script" // 以JSX的形式修改AE專案，原則上與JS無太大不同，主要是互動的物件轉為AE特有的DOM，詳情可以參考AE scripting的相關資訊
        }
    ]
}
```
### Actions

與原生套件有著一致規範，在此我們使用因應glia需求產製的Module Package進行PostRender後移動文件至目標資料夾的動作。
因此在作業上僅需依照以下格式即可順利運作，倘若需要進一步的引用其他package或執行其他渲染前後的動作，可以再參考原文件的做法導入。

```json
{
    "template": {
        ...
    },
    "assets": [
        {
        ...    
    }],
    "actions":{
        "postrender": [
            {
                "module": "action-move-glia", // 引用action-move-glia套件以執行動作
                "output": "C:\\somedir\\somedir" // 指名目標文件夾
            }
        ]
    }
}
```

## Standard Practice
### Core philosophy

在處理流程上，我們希望處理AE rendering時負責AE project的人士和處理程式碼的人員有著一套標準規範以方便彼此作業的順利，且即使在跨專案的情況下依然能通用的形式，以降低混淆的情形並最佳化檔案的管理。

### Naming

本著標準化流程的想法，命名將會是我們專注的一大課題，其中包括專案的命名、影片產製結果的命名、AE project中Comp和Layer的命名，這都關係處理著流程的效率並旨在達到一目了然的效果。

#### Casing

請使用camelcase的形式。 example: myAeProject.aep, myResult.mp4, targetedComposition

#### Compisition

關於compistion的命名，請統一將目標修改的Compisition命名為 renderComp為開頭，並因應該Compisition於影片上出現的時序做進一步標註，
例如於一分三十秒出現的Compisition請將其命名為renderComp_0130。再者若有更詳盡的細節或做敘述補充請加入底線並備註。
example: renderComp_0130_title, renderComp_0130_background 

將管理整個影片的Compisition命名為renderComp_all讓Template有整體影片compisition的預設值

#### Layer

與compisition有類似的命名邏輯，以renderLayer為開頭，並根據更改物件妥善命名，如renderLayer_title, renderLayer_virtualModel。
必須和其他物件區隔的話再加入底線敘述，如renderLayer_title_left。

#### OutputModule

請以 output + 副檔名 + 備註的形式處理並以底線區隔，如output_mov。

#### Name of the video

以renderResult_ 為開頭再加以因應命名。

### Result

在做到這幾點後，可以使Input資料時的管理變得方便以及使更改資料上溝通流程能更加地順暢。

```json
// Expected Format
{
    "template": {
        "src": "file:///C:/where_my_ae_project_located/myAEproject.aep",
        "composition": "renderComp_all",
        "outputModule": "output_mov_1280x720",
        "outputExt": ".mov",
        "name": "renderResult_myVideoName"
    },
    "assets": [
        {
            "src": "https://example.com/assets/image.jpg",
            "type": "image",
            "layerName": "renderLayer_image",
            "composition": "renderComp_0130_background"
        },
        {
            "src": "file:///home/assets/audio.mp3",
            "type": "audio",
            "layerName": "renderLayer_backgroundMusic",
            "composition": "renderComp_all"
        }
    ],
    "actions":{
        "postrender": [
            {
                "module": "action-move-glia", 
                "output": "C:\\somedir\\somedir" 
            }
        ]
    }
}
```





