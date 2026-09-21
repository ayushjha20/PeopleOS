package com.example.demo.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.Entity.Employee;
import com.example.demo.Exception.ResourcenotfoundException;
import com.example.demo.Repository.EmployeeRepository;
import com.example.demo.RequestDTO.EmployeeRequest;
import com.example.demo.ResponseDTO.EmployeeResponse;

@Service
public class EmployeeService {

    private EmployeeRepository repository;

    public EmployeeService(EmployeeRepository repository) {
        this.repository = repository;
    }

    // Dto to Entity
    public Employee dtotoEntity(EmployeeRequest resq) {
        Employee emp = new Employee();
        emp.setId(resq.getId());
        emp.setName(resq.getName());
        emp.setDomain(resq.getDomain());
        emp.setEmail(resq.getEmail());
        emp.setSalary(resq.getSalary());
        emp.setPassword(resq.getPassword());

        return emp;

    }

    // Entity to Dto
    public EmployeeResponse Entitytodto(Employee emp) {
        EmployeeResponse resp = new EmployeeResponse();
        resp.setId(emp.getId());
        resp.setName(emp.getName());
        resp.setDomain(emp.getDomain());
        resp.setEmail(emp.getEmail());
        resp.setSalary(emp.getSalary());

        return resp;
    }

    // create
    public EmployeeResponse createEmp(EmployeeRequest resq) {
        Employee emp = dtotoEntity(resq);
        Employee create = repository.save(emp);
        return Entitytodto(create);
    }

    // Read
    public EmployeeResponse getlist(long id) {
        Employee emp = repository.findById(id)
                .orElseThrow(() -> new ResourcenotfoundException("ID not found!!!"));

        return Entitytodto(emp);

    }

    // Readall
    public List<EmployeeResponse> getall() {
        return repository.findAll()
                .stream()
                .map(this::Entitytodto)
                .toList();
    }

    // update
    public EmployeeResponse update(EmployeeRequest resq, Long id) {
        Employee emp = repository.findById(id)
                .orElseThrow(() -> new ResourcenotfoundException("ID not found!!!"));

        emp.setId(resq.getId());
        emp.setName(resq.getName());
        emp.setDomain(resq.getDomain());
        emp.setEmail(resq.getEmail());
        emp.setSalary(resq.getSalary());

        Employee updated = repository.save(emp);
        return Entitytodto(updated);
    }

    // delete
    public EmployeeResponse delete(Long id) {
        Employee emp = repository.findById(id)
                .orElseThrow(() -> new ResourcenotfoundException("id not found"));

        repository.delete(emp);

        return Entitytodto(emp);
    }

}
