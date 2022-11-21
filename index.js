const fs = require('fs')
require('dotenv').config()
const config = process.env
const fetch = require('node-fetch')

const dataList = (url) => {
  return fetch(url)
	.then((res) => {
    return res.json()
  })
	.then((json) => {
    return json
  })
}

(async () => {
  const SheetList = await dataList(`https://sheets.googleapis.com/v4/spreadsheets/${config.SHEETID}/?key=${config.GAPIKEY}`)
  let SheetData = null

  SheetList.sheets.forEach(value => {
    (async () => {
      SheetData = await dataList(`https://sheets.googleapis.com/v4/spreadsheets/${config.SHEETID}/values/${value.properties.title}?key=${config.GAPIKEY}`)

      let outputData = []
      let toBoolean  = {
        "TRUE": true,
        "FALSE": false
      }
      let dataHeaders = SheetData.values[0]
      let dataBlock = convertToKeys(dataHeaders)
      
      SheetData.values.forEach((value, index) => {
        if(index !== 0){
          dataBlock = convertToKeys(dataHeaders)
          value.forEach((value2, index2) => {
            if(!value2 || value2.match(/[^0-9]/)) {
              if (value2 === "TRUE" || value2 === "FALSE") {
                dataBlock[dataHeaders[index2]] = toBoolean[value2]
              } else {
                dataBlock[dataHeaders[index2]] = value2
              }
            } else {
              dataBlock[dataHeaders[index2]] = +value2
            }
          })
          outputData.push(dataBlock)
        }
      })

      if (!fs.existsSync('./dist/')) {
        fs.mkdirSync('./dist/');
      }

      writeFile(value.properties.title, outputData)
      console.log(`generated json data "./dist/data/${value.properties.title}.json"`)
    })()
  })
})()

const convertToKeys = (list) => {
  return list.reduce((target, key) => {
    target[key]  = null
    return target
  }, {})
}

const writeFile = (name, data) => {
  fs.writeFileSync(`./dist/${name}.json`, JSON.stringify(data, null, '  '), 'utf-8', (error) => {
    if(error) {
      console.log(error)
    }
  })
}

