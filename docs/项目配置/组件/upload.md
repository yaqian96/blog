---
title: 上传文件
date: 2021-08-16
permalink:
categories:
  - 组件
tags:
  - 组件
---

# 1. SDK

cos-js-sdk-v5 ：上传文件
vod-js-sdk-v6：点播组件
上传文件的

```js
import TcVod from "vod-js-sdk-v6";
import COS from "cos-js-sdk-v5";
import { get, post } from "./request";
// import Vue from 'vue'

let uploadConfig = {
  appName: "",
  appKey: "",
};

function checkUrlSchema(url, isHttps = false) {
  if (/^https?:/g.test(url)) {
    return url;
  }
  return `${isHttps ? "https://" : "http://"}${url}`;
}

// 获取项目中的token
const getToken = () => {
  const meInfo = JSON.parse(localStorage.getItem("me") || "{}");
  const token = meInfo.token || "";
  return `Bearer ${token}`;
};

// 获取app信息
const getGeekSign = async () => {
  const { appName, appKey } = uploadConfig;
  const Authorization = getToken();
  const getGKSignature = async () => {
    const result = await get(
      "/service-src/app/getSignature",
      {
        appName,
        appKey,
        _ch: new Date().getTime(),
      },
      { Authorization }
    );
    return result;
  };
  try {
    const result = await getGKSignature();
    uploadConfig = {
      ...uploadConfig,
      ...(result.data || {}),
    };
    return result;
  } catch (error) {
    console.log("=== signg error: ", error);
    return Promise.reject(error);
  }
};

async function getSignature() {
  const { sign } = uploadConfig;
  const Authorization = getToken();
  const result = await get(
    "/service-src/app/getVodSignature",
    {},
    { Authorization, sign }
  );
  return result.data || "";
}

const getAuthorization = async (options, callback) => {
  const Authorization = getToken();
  const { Key } = options;
  const { sign } = uploadConfig;
  const resut = await get(
    `/service-src/app/getPutSignature`,
    { key: `/${Key}`, method: "PUT" },
    { Authorization, sign }
  );
  callback({
    Authorization: resut.data,
  });
};

const cos = new COS({
  getAuthorization,
});
const tcVod = new TcVod({
  getSignature,
});

const uploadVod = (params, headers = {}, timeout) => {
  const Authorization = getToken();
  return post("/service-src/upload/putVod", params, {
    Authorization,
    ...headers,
    timeout,
  });
};

const putCos = (params, headers = {}, timeout) => {
  const Authorization = getToken();
  return post("/service-src/upload/putCos", params, {
    Authorization,
    ...headers,
    timeout,
  });
};

// 上传视频文件
const uploadVideoFile = async ({
  opBy,
  file,
  cb,
  headers = {},
  asynchronous = true,
  timeout,
}) => {
  const { uid, name, size } = file;
  const format =
    file.name.split(".")[file.name.split(".").length - 1] || file.type;
  // 上传前等待
  cb && cb({ name, uid, format, size, status: "waiting", error: null });

  const uploader = tcVod.upload({
    mediaFile: file,
  });
  let isCanced = false;
  // 取消上传
  const cancel = (isTimeout = false) => {
    isCanced = true;
    uploader.cancel();
    const params = {
      opBy,
      file,
      headers,
      cb,
    };
    const retryInfo = handleUploadRetry(
      params,
      "task cancel",
      isTimeout ? "timeout" : "canceled"
    );
    cb && cb({ name, uid, format, size, ...retryInfo });
  };

  uploader.on("media_progress", (info) => {
    !isCanced &&
      cb &&
      cb({
        ...info,
        uploader: { cancel },
        name,
        uid,
        size,
        format,
        status: "uploading",
        error: null,
      });
  });

  try {
    const vodRes = await uploader.done();
    const { fileId } = vodRes;
    !isCanced &&
      cb &&
      cb({
        uid,
        name,
        size,
        format,
        status: "processing",
        uploader: { cancel },
      });
    const geekUploadRes = await uploadVod(
      {
        fileId,
        asynchronous,
        opBy,
      },
      {
        sign: uploadConfig.sign,
        ...headers,
      },
      timeout
    );
    const { data } = geekUploadRes || {};
    !isCanced && cb && cb({ ...data, uid, status: "done" });
  } catch (error) {
    const parmas = { opBy, file, headers, cb };
    const retryInfo = handleUploadRetry(parmas, error, "error");
    !isCanced && cb && cb({ name, uid, format, size, ...retryInfo });
  }
};

// 上传除视频以外的文件
const uploadCosFile = async ({ opBy, file, cb, headers = {}, timeout }) => {
  const name = `${file.uid}-${file.name}`;
  const format =
    file.name.split(".")[file.name.split(".").length - 1] || file.type;
  const fileName = file.name;
  const { size, uid } = file;
  cb &&
    cb({ name: fileName, uid, format, size, status: "waiting", error: null });
  let taskId = "";
  const isCanceled = false;
  const cancel = (isTimeout = false) => {
    // 取消上传
    taskId && cos.cancelTask(taskId);
    const params = { opBy, file, cb, headers };
    const retryInfo = handleUploadRetry(
      params,
      isTimeout ? "timeout" : "task canceled",
      "canceled"
    );
    cb && cb({ name: fileName, uid, format, size, ...retryInfo });
  };
  let timer = null;

  // 超时
  const customTimeout = () => {
    if (!timer) {
      timer = setTimeout(() => {
        cancel(true);
      }, timeout);
      return;
    }
    clearTimeout(timer);
    timer = setTimeout(() => {
      cancel(true);
    }, timeout);
  };

  const clearCustomTimer = () => {
    timer && clearTimeout(timer);
    timer = null;
  };

  cos.putObject(
    {
      Bucket: uploadConfig.bucket /* 必须 */,
      Region:
        uploadConfig.region || "ap-chengdu" /* 存储桶所在地域，必须字段 */,
      Key: `${uploadConfig.key}/${name}` /* 必须 */,
      StorageClass: "STANDARD",
      Body: file, // 上传文件对象
      onProgress(progressData) {
        const uploader = {
          cancel,
        };
        customTimeout();
        !isCanceled &&
          cb &&
          cb({
            ...progressData,
            uploader,
            name: fileName,
            uid,
            format,
            size,
            status: "uploading",
            error: null,
          });
      },
      onTaskReady(id) {
        taskId = id;
      },
    },
    async function(err, result) {
      clearCustomTimer();
      if (!err) {
        const { Location } = result || {};
        const remarks = "";
        const url = checkUrlSchema(Location, true);
        !isCanceled &&
          cb &&
          cb({
            url,
            name: fileName,
            size,
            uid,
            format,
            status: "processing",
            error: null,
          });
        const { data } =
          (await putCos(
            { fileName, format, url, size, opBy, name, remarks },
            { sign: uploadConfig.sign, ...headers },
            timeout
          )) || {};
        !isCanceled &&
          cb &&
          cb({
            url,
            name: fileName,
            size,
            uid,
            format,
            resourceId: data,
            status: "done",
            error: null,
          });
      } else {
        const params = { opBy, file, cb, headers };
        const retryInfo = handleUploadRetry(params, err, "error");
        !isCanceled && cb && cb({ name, size, format, uid, ...retryInfo });
      }
    }
  );
};

// 上传失败后的操作
const handleUploadRetry = (params, message, status) => {
  const retry = () => {
    return uploadFile({ ...params });
  };
  return {
    uploader: {
      retry,
    },
    status,
    error: message,
  };
};

//
const uploadFile = async ({
  opBy,
  file,
  cb,
  headers = {},
  asynchronous = true,
  timeout = 60000,
}) => {
  if (!(uploadConfig.appKey && uploadConfig.appName)) {
    throw new Error(
      "在使用Geek-Upload组件时，请配置 appName， appKey. Vue.use(GeekUpload, { appName: '', appKey: '' })"
    );
  }
  if (!uploadConfig.sign) {
    try {
      await getGeekSign();
      if (/video/g.test(file.type)) {
        uploadVideoFile({ opBy, file, cb, headers, asynchronous, timeout });
      } else {
        uploadCosFile({ opBy, file, cb, headers, timeout });
      }
    } catch (error) {
      const { uid, name, size } = file;
      cb && cb({ status: "error", message: error, name, uid, size });
      console.log(error);
    }
    return;
  }
  if (/video/g.test(file.type)) {
    uploadVideoFile({ opBy, file, cb, headers, asynchronous, timeout });
  } else {
    uploadCosFile({ opBy, file, cb, headers, timeout });
  }
};

const configVod = async (appName, appKey) => {
  uploadConfig.appKey = appKey;
  uploadConfig.appName = appName;
  await getGeekSign();
};

export { uploadFile, configVod };
```

# 2. type=file：普通表单上传

```js
<form action="/index.php" method="POST" enctype="multipart/form-data">
 <input type="file" name="myfile">
 <input type="submit">
</form>
```

# 2. 文件编码上传

```js
1. 文件进行编码，然后在服务端进行解码，其主要实现原理就是将图片转换成base64进行传递
2. formData异步上传
document.querySelector("#file").addEventListener("change",function () {
  //获取到选中的文件
  var file = document.querySelector("#file").files[0];
  //创建formdata对象
  var formdata = new FormData();
  formdata.append("file",file);
  //创建xhr，使用ajax进行文件上传
  var xhr = new XMLHttpRequest();
  xhr.open("post","/");
  //回调
  xhr.onreadystatechange = function () {
      if (xhr.readyState==4 && xhr.status==200){
          document.querySelector("#callback").innerText = xhr.responseText;
      }
  }
  //获取上传的进度
  xhr.upload.onprogress = function (event) {
      if(event.lengthComputable){
          var percent = event.loaded/event.total *100;
          document.querySelector("#progress .progress-item").style.width = percent+"%";
      }
  }
  //将formdata上传
  xhr.send(formdata);
});
3. iframe无刷新页面
在低版本的浏览器（如IE）上，xhr是不支持直接上传formdata的，因此只能用form来上传文件，而form提交本身会进行页面跳转，
function upload(){
 var now = +new Date()
 var id = 'frame' + now
 $("body").append(`<iframe style="display:none;" name="${id}" id="${id}" />`);
 var $form = $("#myForm")
 $form.attr({
 "action": '/index.php',
 "method": "post",
 "enctype": "multipart/form-data",
 "encoding": "multipart/form-data",
 "target": id
 }).submit()
 $("#"+id).on("load", function(){
 var content = $(this).contents().find("body").text()
 try{
 var data = JSON.parse(content)
 }catch(e){
 console.log(e)
 }
 })
}
```

# 3. 大文件上传的解决方法

拆分上传（切片）、断点续传、显示文件的上传进度和暂停上传

```js
文件秒传：即在服务端已经存在了上传的资源，所以当用户再次上传时会直接提示上传成功。
1. 前端上传大文件时使用 Blob.prototype.slice 将文件切片，并发上传多个切片，最后发送一个合并的请求通知服务端合并切片。
2. 服务端接收切片并存储，收到合并请求后使用 fs.appendFileSync 对多个切片进行合并。
3. 原生 XMLHttpRequest 的 upload.onprogress 对切片上传进度的监听。
4. 使用 Vue 计算属性根据每个切片的进度算出整个文件的上传进度。
断点续传：
使用 spart-md5 根据文件内容算出文件 hash。
通过 hash 可以判断服务端是否已经上传该文件，从而直接提示用户上传成功（秒传）。
通过 XMLHttpRequest 的 abort 方法暂停切片的上传。
上传前服务端返回已经上传的切片名，前端跳过这些切片的上传。
```
