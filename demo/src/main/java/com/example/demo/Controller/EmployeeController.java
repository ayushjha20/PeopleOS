package com.example.demo.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.RequestDTO.EmployeeRequest;
import com.example.demo.ResponseDTO.EmployeeResponse;
import com.example.demo.Service.EmployeeService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/employee")
public class EmployeeController {
    private EmployeeService service;

    public EmployeeController(EmployeeService service) {
        this.service = service;
    }

    // create
    @PostMapping("/create")
    public ResponseEntity<EmployeeResponse> createEmp(@Valid @RequestBody EmployeeRequest resq) {
        EmployeeResponse resp = service.createEmp(resq);
        return ResponseEntity.ok(resp);

    }

    // read
    @GetMapping("/get/{id}")
    public ResponseEntity<EmployeeResponse> getlist(@PathVariable Long id) {
        EmployeeResponse resp = service.getlist(id);
        return ResponseEntity.ok(resp);
    }

    // readall
    @GetMapping("/getall")
    public ResponseEntity<List<EmployeeResponse>> getall() {
        List<EmployeeResponse> lists = service.getall();
        return ResponseEntity.ok(lists);
    }

    // update
    @PutMapping("/update/get/{id}")
    public ResponseEntity<EmployeeResponse> update(@Valid @RequestBody EmployeeRequest resq, @PathVariable Long id) {
        EmployeeResponse updatelist = service.update(resq, id);
        return ResponseEntity.ok(updatelist);

    }


    //public 
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<EmployeeResponse> delete (@PathVariable  Long id){
        EmployeeResponse delete = service.delete(id);
        return ResponseEntity.ok(delete);
    }

}