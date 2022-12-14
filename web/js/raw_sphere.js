// expand THREE.js Sphere to support collision tests versus Box3
// we are creating a vector outside the method scope to avoid spawning a new
// instance of Vector3 in every check
THREE.Sphere.__closest = new THREE.Vector3();
THREE.Sphere.prototype.intersectsBox = function (box) {
    // get box closest point to sphere center by clamping
    THREE.Sphere.__closest.set(this.center.x, this.center.y, this.center.z);
    THREE.Sphere.__closest.clamp(box.min, box.max);

    var distance = this.center.distanceToSquared(THREE.Sphere.__closest);
    return distance < (this.radius * this.radius);
};

Game.init = function () {
    this.debug = false;

    this.knot = new THREE.Mesh(
        new THREE.TorusKnotGeometry(0.5, 0.1), this.materials.solid);
    this.knot.position.set(-3, 2, 1);
    this.knotBBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());

    this.sphere = new THREE.Mesh(
        new THREE.SphereGeometry(1), this.materials.solid);
    this.sphere.position.set(2, 2, 0);
    // We now need to call this:
    this.sphere.geometry.computeBoundingSphere();
    // because while in the past it was done automatically by Three.js since it was needed for
    // frustrum culling, now it seems to not work anymore like that.
    this.sphereBBox = new THREE.Sphere(
        this.sphere.position,
        this.sphere.geometry.boundingSphere.radius);
    this.sphereShadow = Utils.createShadow(this.sphere, this.materials.shadow);

    // the object the user can control to check for collisions
    this.ball = new THREE.Mesh(new THREE.SphereGeometry(0.5),
        this.materials.solid);
    this.ball.position.set(1, 1, 2);
    this.ballShadow = Utils.createShadow(this.ball, this.materials.shadow);
    this.ballBBox = new THREE.Sphere(
        this.ball.position, this.ball.geometry.boundingSphere.radius);

    // add objects to the scene
    this.scene.add(this.ball);
    this.scene.add(this.knot);
    this.scene.add(this.sphere);

    // add fake shadows to the scene
    this.scene.add(Utils.createShadow(this.knot, this.materials.shadow));
    this.scene.add(this.sphereShadow);
    this.scene.add(this.ballShadow);

    this.controls = new THREE.TransformControls(
        this.camera, this.renderer.domElement);
    this.controls.space = 'world';
    this.controls.attach(this.ball);
    this.scene.add(this.controls);

    this.timestamp = 0;
};

Game.update = function (delta) {
    this.timestamp += delta;

    this.controls.update();

    // rotate the knot
    this.knot.rotation.x += (Math.PI / 4) * delta;
    this.knotBBox.setFromObject(this.knot); // re-calculate AABB

    // change sphere size
    var scale = 0.25 + Math.abs(Math.sin(this.timestamp));
    this.sphere.scale.set(scale, scale, scale);
    // re-calculate bounding sphere
    this.sphereBBox.radius = this.sphere.geometry.boundingSphere.radius * scale;
    // update shadow size
    Utils.updateShadow(this.sphereShadow, this.sphere);

    // update the ball AABB position and shadow
    this.ballBBox.center.set(
        this.ball.position.x, this.ball.position.y, this.ball.position.z);
    Utils.updateShadow(this.ballShadow, this.ball);

    this.sphere.material =
        this.sphereBBox.intersectsSphere(this.ballBBox)
            ? this.materials.colliding
            : this.materials.solid;

    this.knot.material = this.ballBBox.intersectsBox(this.knotBBox)
        ? this.materials.colliding
        : this.materials.solid;
};