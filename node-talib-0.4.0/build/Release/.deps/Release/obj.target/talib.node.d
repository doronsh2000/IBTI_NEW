cmd_Release/obj.target/talib.node := flock ./Release/linker.lock g++ -shared -pthread -rdynamic -m64   -Wl,-soname=talib.node -o Release/obj.target/talib.node -Wl,--start-group Release/obj.target/talib/src/talib.o -Wl,--end-group ../src/lib/lib/libta_libc_csr.a
