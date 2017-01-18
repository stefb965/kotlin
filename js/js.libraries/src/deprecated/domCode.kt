package kotlin.dom

import org.w3c.dom.Document
import org.w3c.dom.Node

@Deprecated("use declarations from org.w3c.dom instead: create document directly via constructor Document() or use document.implementation.createDocument", level = DeprecationLevel.ERROR)
public fun createDocument(): Document = Document()

@Deprecated("use member property outerHTML of Element class instead", level = DeprecationLevel.ERROR)
public inline val Node.outerHTML: String get() = asDynamic().outerHTML

/** Converts the node to an XML String */
@Deprecated("use outerHTML directly", level = DeprecationLevel.ERROR)
public fun Node.toXmlString(): String = this.outerHTML

/** Converts the node to an XML String */
@Deprecated("use outerHTML directly", level = DeprecationLevel.ERROR)
public fun Node.toXmlString(xmlDeclaration: Boolean): String = this.outerHTML
