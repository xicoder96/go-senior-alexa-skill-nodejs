// @ts-check

const distribution_domain_name = "d2bhc2eaizqsmh.cloudfront.net"

function getVideoSourceUrl(file_name) {
    const prefix = "videos/"
    return `https://${distribution_domain_name}/${prefix}${file_name}`
}
function getImageSourceUrl(file_name) {
    const prefix = "images/"
    return `https://${distribution_domain_name}/${prefix}${file_name}`
}

function getMusicSourceUrl(file_name) {
    const prefix = "music/"
    return `https://${distribution_domain_name}/${prefix}${file_name}`
}

/**
 * get Video Source URL lists
 * @param {string | string[]} file_names 
 * @returns 
 */
function getVideoSourcesUrlList(file_names) {
    let sources = []
    if (Array.isArray(file_names)) {
        file_names.forEach(name => {
            sources.push(getVideoSourceUrl(name))
        })
    } else {
        sources.push(getVideoSourceUrl(file_names))
    }
    return sources
}

module.exports = {
    getVideoSourceUrl,
    getImageSourceUrl,
    getMusicSourceUrl,
    getVideoSourcesUrlList,
}