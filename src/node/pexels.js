var request = require('request');
var fs = require('fs');
var headers = {
    'User-Agent': 'Apipost client Runtime/+https://www.apipost.cn/',
    'Authorization': '563492ad6f91700001000001a306a646d8374dcf8b3d64f66c4d7a80',
    'Content-Type': 'application/json'
};
var options = {
    url: 'https://api.pexels.com/v1/search',
    method: 'GET',
    headers: headers,
    qs: {
        query: 'fireworks',
        page:1,
        per_page: 80,
        size:"", // medium
        orientation: "portrait",
        color:null,
        locale:null
    }
};

 function downloadFile(url, name) {
     request({url}).pipe(
         fs.createWriteStream(`D:/抖音素材/摄影号/冬天/${name}.jpeg`).on('close', err => {
            if (!err) {
                console.log(name+'下载成功')
            } else {
                console.log(name+'下载失败------')
            }
        })
    )
}

 function callback(error, response, res) {
    // console.log(response)
    if (!error && response.statusCode == 200) {
        const {photos, total_results } = JSON.parse(res)
        console.log('photos', total_results, photos?.length)
        for (const item of photos) {
            downloadFile(item.src.original, item.id)
            // console.log('item.src.original', item.src.large2x)

        }
    }

}
request(options, callback);
