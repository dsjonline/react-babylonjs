import { CreatedInstance } from "../CreatedInstance"
import { LifecycleListener } from "../LifecycleListener"
import { Color3, Scene, StandardMaterial, Mesh } from "babylonjs"

export default class AdvancedDynamicTextureLifecycleListener implements LifecycleListener {
  private props: any
  private scene: Scene

  constructor(scene: Scene, props: any) {
    this.scene = scene
    this.props = props
  }

  onParented(parent: CreatedInstance<any>, child: CreatedInstance<any>): any {}

  onChildAdded(child: CreatedInstance<any>, parent: CreatedInstance<any>): any {}

  onMount(instance: CreatedInstance<any>): void {
    this.addControls(instance)

    if (instance.customProps.createForParentMesh === true) {
      // console.log('for parent mesh', instance.parent ? instance.parent.babylonJsObject : 'error: no parent object')

      let mesh: Mesh = instance.parent!.hostInstance // should crawl parent hierarchy for a mesh
      // console.error('we will be attaching the mesh:', mesh.name, mesh);

      var material = new StandardMaterial("AdvancedDynamicTextureMaterial", mesh.getScene())
      material.backFaceCulling = false
      material.diffuseColor = Color3.Black()
      material.specularColor = Color3.Black()

      if (this.props.onlyAlphaTesting) {
        material.diffuseTexture = instance.hostInstance
        material.emissiveTexture = instance.hostInstance
        instance.hostInstance.hasAlpha = true
      } else {
        material.emissiveTexture = instance.hostInstance
        material.opacityTexture = instance.hostInstance
      }

      mesh.material = material

      let supportPointerMove = this.props.supportPointerMove === true ? true : false

      instance.hostInstance.attachToMesh(mesh, supportPointerMove)
    }
  }

  addControls(instance: CreatedInstance<any>) {
    // When there is a panel, it must be added before the children. Otherwise there is no UtilityLayer to attach to.
    // This project before 'react-reconciler' was added from parent up the tree.  'react-reconciler' wants to do the opposite.
    instance.children.forEach(child => {
      if (child.metadata.isGUI2DControl === true) {
        instance.hostInstance.addControl(child.hostInstance)
        child.state = { added: true }
      }
    })

    if (instance.customProps.connectControlNames !== undefined && Array.isArray(instance.customProps.connectControlNames)) {
      let controlNames: string[] = instance.customProps.connectControlNames
      let root = instance
      while (root.parent !== null) {
        root = root.parent
      }
      this.connect(
        instance,
        root,
        controlNames
      )
    }

    instance.children.forEach(child => {
      this.addControls(child)
    })
  }

  connect(keyboard: CreatedInstance<any>, searchInstance: CreatedInstance<any>, controlNames: string[]) {
    if (searchInstance.metadata.isGUI2DControl && searchInstance.hostInstance && controlNames.indexOf(searchInstance.hostInstance.name) !== -1) {
      // console.log(keyboard.hostInstance, '.connect(->', searchInstance.hostInstance)
      keyboard.hostInstance.connect(searchInstance.hostInstance)
    }

    searchInstance.children.forEach(child =>
      this.connect(
        keyboard,
        child,
        controlNames
      )
    )
  }
}
