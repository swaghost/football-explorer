import { TestBed } from '@angular/core/testing';

import { ColorsService } from './colors.service';

describe('ColorsService', () => {
  let service: ColorsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ColorsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return drawing colors', () => {
    const colors = service.getDrawingColors();
    expect(colors).toEqual([
      '#ff0000', '#00ff00', '#0000ff', '#ffff00',
      '#ff00ff', '#00ffff', '#000000', '#ffffff',
      '#ff8000', '#8000ff', '#808080', '#964B00'
    ]);
  });

  it('should have default selected color as red', () => {
    expect(service.getSelectedDrawingColor()).toBe('#ff0000');
  });

  it('should set and get selected drawing color', () => {
    service.setSelectedDrawingColor('#0000ff');
    expect(service.getSelectedDrawingColor()).toBe('#0000ff');
  });

  it('should not set invalid drawing color', () => {
    const invalidColor = '#123456';
    service.setSelectedDrawingColor(invalidColor);
    expect(service.getSelectedDrawingColor()).not.toBe(invalidColor);
  });

  it('should validate drawing colors correctly', () => {
    expect(service.isValidDrawingColor('#ff0000')).toBe(true);
    expect(service.isValidDrawingColor('#123456')).toBe(false);
  });

  it('should return correct selection colors', () => {
    expect(service.getSelectionColor('single')).toBe('#00bcd4');
    expect(service.getSelectionColor('multi')).toBe('#4caf50');
    expect(service.getSelectionColor('highlight')).toBe('#ff9800');
  });

  it('should return correct node colors', () => {
    expect(service.getNodeColor('root')).toBe('#d84315');
    expect(service.getNodeColor('child')).toBe('#1565c0');
  });

  it('should return correct theme-based colors', () => {
    expect(service.getBorderColor(false)).toBe('#2196f3');
    expect(service.getBorderColor(true)).toBe('#64b5f6');
    
    expect(service.getBackgroundColor(false)).toBe('#f8f8f8');
    expect(service.getBackgroundColor(true)).toBe('#2a2a2a');
    
    expect(service.getTextColor(false)).toBe('#333');
    expect(service.getTextColor(true)).toBe('#fff');
  });

  it('should return correct lasso colors', () => {
    expect(service.getLassoColor('select')).toBe('#ff6600');
    expect(service.getLassoColor('deselect')).toBe('#ff0066');
  });

  it('should get color names correctly', () => {
    expect(service.getColorName('#ff0000')).toBe('Red');
    expect(service.getColorName('#00ff00')).toBe('Green');
    expect(service.getColorName('#unknown')).toBe('#unknown');
  });

  it('should reset selected color to default', () => {
    service.setSelectedDrawingColor('#0000ff');
    service.resetSelectedDrawingColor();
    expect(service.getSelectedDrawingColor()).toBe('#ff0000');
  });
});