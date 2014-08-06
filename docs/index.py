import os
import cherrypy

class StaticAndDynamic(object):
    _cp_config = {'tools.staticdir.on' : True,
                  'tools.staticdir.dir' : os.path.dirname(os.path.abspath(__file__)) + '/build/html',
                  'tools.staticdir.index' : 'index.html',
    }

    @cherrypy.expose
    def do_contact(self, **params):
        """Stuff to make a contact happen."""
        pass

cherrypy.config.update({
    'server.socket_host': '0.0.0.0',
    'server.socket_port': int(os.getenv('HTTP_PORT', 8080))
})
cherrypy.quickstart(StaticAndDynamic())
