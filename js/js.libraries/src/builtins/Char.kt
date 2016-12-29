/*
 * Copyright 2010-2016 JetBrains s.r.o.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package kotlin

public class Char(v: Int): Comparable<Char> {
    val value: Int = v and 0xFFFF

    override fun compareTo(other: Char) = value.compareTo(other.value)

    override fun equals(other: Any?) = other is Char && value === other.value

    override fun hashCode(): Int = value

    override fun toString(): String = js("String.fromCharCode")(value)

    operator fun dec(): Char = Char(value - 1)

    operator fun inc(): Char = Char(value + 1)

    operator fun minus(other: Char): Int = value - other.value

    operator fun minus(other: Int): Char = Char(value - other)

    operator fun plus(other: Int): Char = Char(value + other)

    operator fun rangeTo(other: Char): CharRange = CharRange(this, other)

    fun toByte(): Byte = value.toByte()

    fun toChar(): Char = this

    fun toDouble(): Double = value.toDouble()

    fun toFloat(): Float = value.toFloat()

    fun toInt(): Int = value

    fun toLong(): Long = value.toLong()

    fun toShort(): Short = value.toShort()
}