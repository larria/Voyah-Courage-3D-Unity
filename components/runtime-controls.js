/** Controls verified against the original serialized scene and Unity runtime. */
export const RUNTIME_CONTROL_CAPABILITIES = Object.freeze({
  trunk: Object.freeze({ supported: true, target: '/ZY', method: 'toggleTrunk', mode: 'toggle' }),
  doors: Object.freeze({ supported: false, reason: 'toggleDoor takes Common.Car.DoorID; the original numeric SendMessage bridge throws during dispatch. No single-argument Int32 wrapper exists.' }),
  windows: Object.freeze({ supported: false, reason: 'toggleDoorWindow takes Common.Car.DoorID; the original numeric SendMessage bridge throws during dispatch. No single-argument Int32 wrapper exists.' }),
});

/** Pass the loaded original unityInstance. This API reports dispatch, not observed state. */
export function createRuntimeControls(unityInstance) {
  if (!unityInstance || typeof unityInstance.SendMessage !== 'function') {
    throw new TypeError('A loaded Unity instance with SendMessage is required.');
  }
  return Object.freeze({
    capabilities: RUNTIME_CONTROL_CAPABILITIES,
    toggleTrunk() {
      // Bare "ZY" resolves the nested mesh namesake, not the root CarConfigurator.
      unityInstance.SendMessage('/ZY', 'toggleTrunk');
      return Object.freeze({ dispatched: true, target: '/ZY', method: 'toggleTrunk' });
    },
  });
}
