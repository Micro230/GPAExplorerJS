const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const monthMap = {
    January: 0,
    February: 1,
    March: 2,
    April: 3,
    May: 4,
    June: 5,
    July: 6,
    August: 7,
    September: 8,
    October: 9,
    November: 10,
    December: 11
};
var container = document.getElementById("imageTable");
var previewWindow = document.getElementById("previewWindowContainer");
var videoPreview = document.getElementById("vidWindow");
var imagePreview = document.getElementById("imgWindow");
var titleContainer = document.getElementById("titles");
var titles = [];
var imgData = [];

/*Server to Client Communication*/
window.electronAPI.initClient((event, data) => {
    titles.push("all");
    titles.push("unknown");
    previewWindow.onclick = HidePreview;

    //For every image
    for (let i = 0; i < data.length; i++) {
        const formatDate = data[i].year + "-" + monthMap[data[i].month];
        if(!titles.includes(formatDate) && formatDate != "-1-undefined") {
            titles.push(formatDate);
        }
    }
    titles.sort((a, b) => {
        const [yearA, monthA] = a.split('-').map(Number);
        const [yearB, monthB] = b.split('-').map(Number);
    
        // Compare years first
        if (yearA !== yearB) {
          return yearB - yearA;
        }
        // If years are the same, compare months
        return monthB - monthA;
    });

    for(const index in titles) {
        let newDiv = document.createElement("div");
        let title = titles[index];
        if(title.includes("-")) {
            let formatDate = title.split("-")[0] + " " + monthNames[title.split("-")[1] - 1];
            newDiv.innerHTML = formatDate;
        }
        else {
            newDiv.innerHTML = capitalizeFirstLetter(title);
        }
        newDiv.classList.add("navTitle");
        newDiv.onclick = (function() {
            return function() {
                BuildTable(title);
            };
        })();
        titleContainer.append(newDiv);
    }

    imgData = data;
});

function BuildTable(dateRange) {
    container.innerHTML = "";
    let count = 0;
    const limit = 8;
    const startDate = new Date(dateRange + "-" + "1");
    const endDate = new Date(dateRange + "-" + "31");
    console.log(dateRange);

    //For every image
    let newRow = document.createElement("tr");
    for (let i = 0; i < imgData.length; i++) {
        const formatDate = imgData[i].year + "-" + monthMap[imgData[i].month] + "-" + imgData[i].day;
        const checkDate = new Date(formatDate);
        if((checkDate >= startDate && checkDate <= endDate) || dateRange == "all" || (checkDate == "Invalid Date" && dateRange == "unknown")) {
            let newData = document.createElement("td");
            let newImg = document.createElement("img");
            newImg.src = "./database/" + imgData[i].url;
            newImg.onclick = (function(index) {
                return function() {
                    ShowPreview("./database/" + imgData[index].url, imgData[index].isVideo);
                };
            })(i);
            newData.append(newImg);
            newRow.append(newData);
            count++;

            if (count === limit) {
                // Reset count and break to the next line
                container.append(newRow);
                newRow = document.createElement("tr");
                count = 0;
            }
        }
    }

    if (newRow.children.length > 0) {
        container.append(newRow);
    }
}

function ShowPreview(url, video) {
    if(video) {
        previewWindow.style.display = "block";
        videoPreview.style.display = "block";
        imagePreview.style.display = "none";
        videoPreview.src = url;
    }
    else {
        previewWindow.style.display = "block";
        videoPreview.style.display = "none";
        imagePreview.style.display = "block";
        imagePreview.src = url;
    }
}

function HidePreview() {
    previewWindow.style.display = "none";
    videoPreview.style.display = "none";
    imagePreview.style.display = "none";
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}