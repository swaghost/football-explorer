import { TestBed } from '@angular/core/testing';
import { DrawerManagerService } from './drawer-manager.service';

describe('DrawerManagerService', () => {
  let service: DrawerManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DrawerManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should register a drawer', () => {
    service.registerDrawer('test', 'left');
    expect(service.getDrawerIds()).toContain('test');
  });

  it('should toggle drawer state', (done) => {
    service.registerDrawer('test', 'left');

    service.isOpen('test').subscribe((isOpen) => {
      if (isOpen) {
        expect(isOpen).toBe(true);
        done();
      }
    });

    service.toggle('test');
  });

  it('should close other drawers on same side when opening', () => {
    service.registerDrawer('drawer1', 'left');
    service.registerDrawer('drawer2', 'left');
    service.registerDrawer('drawer3', 'right');

    // Open drawer1
    service.open('drawer1');
    expect(service.isOpenSync('drawer1')).toBe(true);

    // Open drawer2 (should close drawer1)
    service.open('drawer2');
    expect(service.isOpenSync('drawer1')).toBe(false);
    expect(service.isOpenSync('drawer2')).toBe(true);

    // Open drawer3 (should not affect drawer2 since it's on different side)
    service.open('drawer3');
    expect(service.isOpenSync('drawer2')).toBe(true);
    expect(service.isOpenSync('drawer3')).toBe(true);
  });

  it('should get drawer IDs by position', () => {
    service.registerDrawer('left1', 'left');
    service.registerDrawer('left2', 'left');
    service.registerDrawer('right1', 'right');

    const leftDrawers = service.getDrawerIds('left');
    const rightDrawers = service.getDrawerIds('right');

    expect(leftDrawers).toEqual(['left1', 'left2']);
    expect(rightDrawers).toEqual(['right1']);
  });

  it('should close all drawers on a side', () => {
    service.registerDrawer('left1', 'left');
    service.registerDrawer('left2', 'left');
    service.registerDrawer('right1', 'right');

    service.open('left1');
    service.open('left2');
    service.open('right1');

    service.closeAllOnSide('left');

    expect(service.isOpenSync('left1')).toBe(false);
    expect(service.isOpenSync('left2')).toBe(false);
    expect(service.isOpenSync('right1')).toBe(true);
  });

  it('should count open drawers', () => {
    service.registerDrawer('left1', 'left');
    service.registerDrawer('left2', 'left');
    service.registerDrawer('right1', 'right');

    service.open('left1');
    service.open('right1');

    expect(service.getOpenCount()).toBe(2);
    expect(service.getOpenCount('left')).toBe(1);
    expect(service.getOpenCount('right')).toBe(1);
  });

  it('should unregister drawer', () => {
    service.registerDrawer('test', 'left');
    expect(service.getDrawerIds()).toContain('test');

    service.unregisterDrawer('test');
    expect(service.getDrawerIds()).not.toContain('test');
  });
});
