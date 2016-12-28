package foo


inline fun foo(): Char? {
    return 'K'
}

fun box(): String {
    if ('O'.toString() + "K" != "OK") return "fail toString"

//
//    if (!' '.isWhitespace()) return "fail white"
//
//    var q = "O${foo()}"
//    if (q != "OK") return "fail122"
//
//    val s = StringBuilder()
//    s.append("a")
//    s.append("b").append("c")
//    s.append('d').append("e")
//
//    if (s.toString() != "abcde") return s.toString()
    return "OK"
}