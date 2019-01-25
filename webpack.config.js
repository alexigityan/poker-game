const path = require("path");

module.exports = {
    mode: "development",
    watch: true,
    watchOptions: {
        ignored:["node_modules", "server"]
    },
    entry:"./src/index.js",
    output: {
        filename:"main.js",
        path: path.resolve(__dirname,"dist")
    },

    devServer: {
        contentBase: path.resolve(__dirname,"dist"),
        disableHostCheck: true
    },

    module: {
        rules: [
            {
                test:/\.js$/,
                exclude: /node_modules/,
                use: {
                    loader:"babel-loader",
                    options: {
                        presets: ["@babel/preset-env", "@babel/preset-react"]
                    }
                }
                
            }
        ]
    }
    
};
