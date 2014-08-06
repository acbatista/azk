/**
 * Documentation: http://docs.azk.io/Azkfile.js
 */

// Adds the systems that shape your system
systems({
  example: {
    // Dependent systems
    depends: [],
    provision: [
      "virtualenv /azk/pyenv",
      "source /azk/pyenv/bin/activate",
      "pip install Sphinx",
      "pip install --no-use-wheel CherryPy",
    ],
    // More images:  http://images.azk.io
    image: "dockerfile/python",
    workdir: "/azk/#{manifest.dir}",
    shell: "/bin/bash",
    command: "./bin/inve python index.py",
    // Mounts folders to assigned paths
    mount_folders: {
      '.': "/azk/#{manifest.dir}",
    },
    scalable: { default: 1 },
    http: {
      hostname: "#{system.name}.azk.#{azk.default_domain}",
    },
    ports: {
      http: "9090/tcp",
    },
    persistent_folders: [ "/azk/pyenv" ],
    envs: {
      // set instances variables
      //EXAMPLE: "value",
    },
  },
});



