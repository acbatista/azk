import h from 'spec/spec_helper';
import { config, async, Q } from 'azk';
import { System } from 'azk/system';
import { Scale } from 'azk/system/scale';
import { SystemDependError, SystemNotScalable } from 'azk/utils/errors';
import docker from 'azk/docker';

describe("systems, scale", function() {
  var manifest, system, system_db;

  before(function() {
    return h.mockManifest({}).then((mf) => {
      manifest  = mf;
      system    = manifest.system("example");
      system_db = manifest.system("db");
    });
  });

  describe("scale one system", function() {
    afterEach(function() {
      return system.killAll().fail(() => {});
    });

    it("should not run system if its dependencies are not met", function() {
      var result = system.scale(1);
      return h.expect(result).to.eventually.rejectedWith(SystemDependError);
    });

    it("should raise erro if scale system above the limit of instances", function() {
      var result = system_db.scale(2);
      return h.expect(result).to.eventually.rejectedWith(SystemNotScalable);
    });

    it("should scale one instances", function() {
      var db = manifest.system('db');
      return async(this, function* () {
        var result = yield db.scale(1);
        var instances = yield db.instances();

        h.expect(result).to.ok;
        h.expect(instances).to.length(1);

        var container   = yield docker.getContainer(instances[0].Id).inspect();
        var annotations = container.Annotations.azk;
        h.expect(annotations).to.have.deep.property("type", 'daemon');
        h.expect(annotations).to.have.deep.property("sys", db.name);
        h.expect(annotations).to.have.deep.property("seq", '1');
      });
    });

    it("should scale a system with dependencies", function() {
      return async(this, function* () {
        yield manifest.system('db').scale(1);
        yield manifest.system('api').scale(1);
        var result = yield system.scale(3);
        var instances = yield system.instances();

        h.expect(result).to.ok;
        h.expect(instances).to.length(3);

        var container   = yield docker.getContainer(instances[0].Id).inspect();
        var annotations = container.Annotations.azk;
        h.expect(annotations).to.have.deep.property("type", 'daemon');
        h.expect(annotations).to.have.deep.property("sys", system.name);
        h.expect(annotations).to.have.deep.property("seq", '1');
      });
    });

    it("should scale a system and map dependencies envs", function() {
      return async(this, function* () {
        yield manifest.system('db').scale(1);
        yield manifest.system('api').scale(1);
        yield manifest.system('example').scale(1);

        var instances = yield system.instances();
        var container = yield docker.getContainer(instances[0].Id).inspect();
        var envs = container.Config.Env;
        h.expect(envs).to.include.something.match(/PATH=/);
        h.expect(envs).to.include.something.match(/DB_HTTP_PORT=/);
        h.expect(envs).to.include.something.match(/DB_5000_HOST=/);
        h.expect(envs).to.include.something.match(/DB_URL=username:password@.*:\d*/);
        h.expect(envs).to.include.something.match(/API_URL=http:\/\/api.*/);
      });
    });
  });
});

