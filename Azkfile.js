/**
 * Documentation: http://docs.azk.io/Azkfile.js
 */

// Global image to reuse
//addImage('base', { repository: "cevich/empty_base_image" }); // tag: latest

var config = require('azk').config;

systems({

  grunt: {
    image: "dockerfile/nodejs",
    workdir: "/azk/<%= manifest.dir %>",
    mount_folders: {
      ".": "/azk/<%= manifest.dir %>",
    },
    envs: {
      PATH: "/bin:/sbin:/usr/bin:/usr/sbin:/usr/local/bin:/azk/<%= manifest.dir %>/node_modules/.bin"
    }
  },

  docs: {
    // Dependent systems
    depends: [],
    provision: [
      "virtualenv /azk/pyenv",
      "./bin/inve pip install Sphinx",
      "./bin/inve pip install --no-use-wheel CherryPy",
      "./bin/inve pip install sphinx_rtd_theme",
    ],
    // More images:  http://images.azk.io
    image: "azukiapp/python-pandoc",
    workdir: "/azk/#{system.name}",
    shell: "/bin/bash",
    command: "./bin/inve python index.py",
    // Mounts folders to assigned paths
    mount_folders: {
      './docs': "/azk/#{system.name}",
    },
    scalable: { default: 1 },
    http: {
      hostname: "#{system.name}.azk.#{azk.default_domain}",
    },
    persistent_folders: [ "/azk/pyenv" ],
    envs: {
      TERM: "xterm-256color",
    }
  },

  dns: {
    image: config("docker:image_default"),
    command: "dnsmasq --no-daemon --address=/<%= azk.default_domain %>/<%= azk.balancer_ip %>",
    ports: {
      dns: "53:53/udp",
    }
  },

  'balancer-redirect': {
    image: config("docker:image_default"),
    command: "socat TCP4-LISTEN:$HTTP_PORT,fork TCP:$BALANCER_IP:$BALANCER_PORT",
    ports: {
      http: "80:<%= azk.balancer_port %>/tcp",
    }
  },
});

setDefault('docs');
