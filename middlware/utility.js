module.exports = (req, res, next) => {

    const formatedTimestamp = () => {
        const d = new Date()
        const date = d.toISOString().split('T')[0];
        const time = d.toTimeString().split(' ')[0];
        return `${date} ${time}`
    }





    // FORMATTAZIONE DATA - DATETIME
    req.dataTime = formatedTimestamp();

    next();
};