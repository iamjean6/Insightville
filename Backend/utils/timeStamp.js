const timeStamp = () => {
    const dateString = new Date().toLocaleString("en-US", {
        timeZone: "Africa/Nairobi"
    });
    const date = new Date(dateString);
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}-${hours}-${minutes}-${seconds}`;
}

export default timeStamp;