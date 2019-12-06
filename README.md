# AE render for glia

- [Introduction](#introduction)
    - [Features](#features)
    - [How it works](#how-it-works)
    - [Alternatives](#alternatives)
- [Installation](#installation)
- [Usage](#usage)
  - [Job](#job)
    - [Assets](#assets)
    - [Actions](#actions)
    - [Details](#details)
  - [Programmatic](#programmatic)
- [Template rendering](#template-rendering)
  - [Footage items](#footage-items)
    - [Fields](#fields)
    - [Example](#example)
  - [Data items](#data-items)
    - [Fields](#fields-1)
    - [Example](#example-1)
  - [Script items](#script-items)
    - [Fields](#fields-2)
    - [Example](#example-2)
- [Network rendering](#network-rendering)
  - [Using binaries](#using-binaries)
    - [`nexrender-server`](#nexrender-server)
      - [Description:](#description)
      - [Supported platforms:](#supported-platforms)
      - [Requirements:](#requirements)
      - [Example](#example-3)
    - [`nexrender-worker`](#nexrender-worker)
      - [Description:](#description-1)
      - [Supported platforms:](#supported-platforms-1)
      - [Requirements:](#requirements-1)
      - [Example](#example-4)
  - [Using API](#using-api)
- [Tested with](#tested-with)
- [Additional Information](#additional-information)
  - [Protocols](#protocols)
    - [Examples](#examples)
  - [Development](#development)
  - [Project Values](#project-values)
  - [External Packages](#external-packages)
    - [Custom Actions](#custom-actions)
  - [Migrating from v0.x](#migrating-from-v0x)
    - [Naming](#naming)
    - [Structure](#structure)
    - [Assets](#assets-1)
    - [Rendering](#rendering)
    - [CLI](#cli)
  - [Customers](#customers)
  - [Plans](#plans)

## Introduction

藉由nexrender這個套件，我們可以快速地產製以After effects生成的影片，
基本的流程建立於在node的環境中導入nexrender，並以JSON檔的方式INPUT我們目標改變的資料。
進而達到可以順應資料需求，呈現對應INPUT數值的影片內容。

## Nexrender

### Brief

在進行AE render的流程時，請務必先熟悉nexrender原生套件的文檔:
https://github.com/inlife/nexrender/tree/master/packages
總結來說，nexrender使我們在影片產製時多了一個選項，以JSON格式的程式碼影響After effects專案中的內容。
使用上只要使用npm下載套件，並了解其特定的INPUT格式就可以上手，在之後段落我也會大略剖析介紹。

### Caveat

請務必注意的是，為了使這個套件更理想地符合我們的需求，套件的原始碼有些微的修改，以提升作業流程的品質。
因此在此提供提醒些許的細節必須額外注意，在之後的段落也會詳細闡述，但大多的作業結構依然與原生套件無異；
熟悉上段落提供的文檔將能幫助整體流程順利進行。

## How to Start
### After effects

首先，請確認你的機台有妥善地安裝After Effects才能使影片產製的工作順利進行。

### Installation

請用以下程式碼在你的node環境中導入因應我們需求客製化後的Package。
```
npm install --save action-move-glia aerender-core-glia
```

### Usage

在確認本地環境安裝好套件後，即可在文件中導入套件。

```js

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
在同一份文件中你便可以導入JSON檔案，為Rendering步驟做細節上的設定。

### JSON structure

在大體結構分為Template, assets, action三個Object，大致上結構非常分明，使用上只要了解其原則並不困難。

Template讓你導入After effect專案，並指明產製結果後影片格式、命名和產製模組。

Asset使你能指定前者AE專案中的Composition以及其中的layer，以不同方式改變其性質，
這會是你作業上必須專注的地方，你必須和負責AE project的人士妥善溝通建立一套標準的命名規格，
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
        "src": "file:///C:/where_my_ae_project_located/myAEproject.aep", //在此導入你目標AE Project文件，並遵照file protocoal擺放Prefix。
        "composition": "all", /*composition是AE Project中一個物件，我們必須先指名它才能修改底下的layer，此處的value將設定整個渲染過程composition的預設值，假如底下的asset沒有指定哪個composition做修改的話，將以此處的value為準*/
        "outputModule": "someOutputModule", /*在AE project中你能客製化你的輸出模組，這關乎你的影片格式、輸出品質等等，前提是負責AE的人士必須手動創建個別的模組並與你告知你模組名稱，並在此處value加以指定*/
        "outputExt": ".mov", // 出產影片結果格式
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
            "src": "https://example.com/assets/image.jpg", //文件連結
            "type": "image", //指名此為圖片類別
            "layerName": "MyNicePicture.jpg" //以名稱指名composition下的目標Layer，在此物件無設定composition的情況下，將以Template的設定為準
        },
        {
            "src": "file:///home/assets/audio.mp3",
            "type": "audio", //指名此為音源檔類別
            "layerIndex": 15 //以index指名composition下的目標Layer，在此物件無設定composition的情況下，將以Template的設定為準
        },
        {
            "src": "file:///home/assets/video.mp4",
            "type": "video", //指名此為影片檔類別
            "layerIndex": "1",
            "composition": "someComp" //指名目標composition，可以以此指定目標compisition而非Template上的預設值再進行修改
        },
        {
            "type": "data", //指名此為data類別，可以修改after effect物件屬性，如位置，透明度，文字內容等等
            "layerIndex": "1",
            "composition": "somecomp",
            "property": "Source Text",                                                            
            "value": "someText"                
        },
        {
            "type": "data",
            "layerName": "background",
            "property": "Effects.Skin_Color.Color",
            "value": [
                1,
                0,
                0
            ]
        },
        {
            "type": "data",
            "layerIndex": 15,
            "property": "Scale",
            "expression": "[time * 0.1, time * 0.1]"
        },
        {
            "src": "http://example.com/scripts/myscript.jsx",
            "type": "script"
        }
    ]
}
```

