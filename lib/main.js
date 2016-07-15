"use babel";

export default {
    config: {
        executable: {
            type: "string",
            default: "gfortran"
        },
        gfortran_flags: {
            type: "string",
            default: "-Wall -Wextra"
        },
    },

    activate: () => {
        require("atom-package-deps").install("linter-gfortran");
    },

    provideLinter: () => {
        const helpers = require("atom-linter");
        const regex = "(?<file>.+):(?<line>\\d+)[\.:](?<col>\\d+):((.|\\r|\\n)*)(?<type>(Error|Warning|Note)):\\s*(?<message>.*)";
        const tmpdir = require('tmp').dirSync().name;
        return {
            name: "gfortran",
            grammarScopes: [
                "source.fortran.free",
                "source.fortran.fixed",
                "source.fortran.modern",
                "source.fortran.punchcard"
            ],
            scope: "file",
            lintOnFly: false,
            lint: (activeEditor) => {
                const command = atom.config.get("linter-gfortran.executable");
                const file = activeEditor.getPath();

                // Split the users flag string and append flags to specific syntax checking and temporary file directory.
                const args = atom.config
                  .get("linter-gfortran.gfortran_flags")
                  .split(" ")
                  .concat(["-fsyntax-only", "-J", tmpdir, file]);

                return helpers.exec(command, args, {stream: "stderr"}).then(output => {
                    const result = helpers.parse(output, regex)
                    if(output !== '') {
                      const line = result[0].range[0][0];
                      const col = result[0].range[0][1];
                      result[0].range = helpers.rangeFromLineNumber(activeEditor, line, col);
                    }
                    console.log(output);

                    return result;
                });
            }
        };
    }
};
