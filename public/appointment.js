document.addEventListener("readystatechange", (evt) => {
    if (evt.target.readyState === "complete") {
        initApp();
    }
});
const initApp = () => {
    const elements = document.querySelectorAll(".disabled-field");
    // console.log(elements);
    const elements2=document.querySelectorAll(".signin-please")
    elements.forEach((el) => {
        el.removeAttribute("disabled");
    });
    elements2.forEach((el) => {
        el.classList.remove("signin-please");
    });
}