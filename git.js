require("chromedriver");
let fs = require('fs');
const wd = require("selenium-webdriver");
let browser = new wd.Builder().forBrowser('chrome').build();
let finalData = [];
let projectsAdded = 0;
let totalProjects = 0;

async function getIssues(url, i , k) {
    let browser = new wd.Builder().forBrowser('chrome').build();
    await browser.get(url + "/issues");
    let issueBoxes = await browser.findElements(wd.By.css(".Link--primary.v-align-middle.no-underline.h4.js-navigation-open.markdown-title"));
    finalData[i].projects[k]["issues"] = [];
    if (await browser.getCurrentUrl() == (finalData[i].projects[k].projectUrl + "/issues")) {
        for (let l = 0; l < issueBoxes.length && l < 2; l++) {
            let heading = await issueBoxes[l].getAttribute("innerText");
            let issueUrl = await issueBoxes[l].getAttribute("href");
            finalData[i].projects[k].issues.push({ "heading": heading, "url": issueUrl });
        }
    }
    projectsAdded += 1;
    if(projectsAdded == totalProjects){
        fs.writeFileSync("finalData.json", JSON.stringify(finalData));
    }
    browser.close();
}


async function getProjects(url, i) {
    let browser = new wd.Builder().forBrowser('chrome').build();
    await browser.get(url);
    let projectBoxes = await browser.findElements(wd.By.css("a.text-bold"));
    totalProjects += (projectBoxes.length > 2 ? 2 : projectBoxes.length);
    finalData[i]["projects"] = [];
    for (j = 0; j < projectBoxes.length && j < 2; j++) {
        finalData[i].projects.push({ projectUrl: await projectBoxes[j].getAttribute("href") });
    }
    for (let k = 0; k < finalData[i].projects.length; k++) {
        getIssues(finalData[i].projects[k].projectUrl, i , k);
    }
    browser.close();
}

async function main() {
    await browser.get("https://github.com/topics");
    await browser.wait(wd.until.elementLocated(wd.By.css(".no-underline.d-flex.flex-column.flex-justify-center")));
    let topicBoxes = await browser.findElements(wd.By.css(".no-underline.d-flex.flex-column.flex-justify-center"));
    let urls = [];
    for (let i = 0; i < topicBoxes.length; i++) {
        let url = await topicBoxes[i].getAttribute("href");
        finalData.push({ topicUrl: url });
    }

    for (let i = 0; i < finalData.length; i++) {
        getProjects(finalData[i].topicUrl, i);
    }
    browser.close();
}

main();