describe('command line interface will', function () {

  describe('has admin functions', function(){
    it('can login')
    it('can logout')
    it('can use a device')
    it('can set an environment setting')
    it('can set an application configuration')
  })

  describe('has device management functions', function(){
    describe('supports a simulator', function(){
      it('can initialize a new simulated device')
      it('can restore the stock image')
      it('can start a simulator')
      it('can stop a simulator')
      it('can save a simulator into a custom state')
      it('can clear the simulator')
    })

    it('can list devices')
    it('can list apps installed')
    it('can list all apps on devices')
    it('can list all groups')
    it('can reboot a matrix')
  })


  describe('has application management functions', function () {
    it('can search for apps')
    it('can search for sensors')
    it('can install apps')
    it('can install sensors')
    it('can uninstall apps')
    it('can update apps')
    it('can start apps')
    it('can stop apps')
  })

  describe('has application development functions', function(){
    it('can create a new application')
    it('can deploy an application')
    it('can trigger a test in an application')
    it('can log data from applications')
  })



})
